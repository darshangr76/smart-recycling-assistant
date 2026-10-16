import { describe, it, expect, beforeEach } from 'vitest';
import { ImpactService } from '../services/impactService';
import { WasteClassification } from '../types';

describe('ImpactService Unit Tests', () => {
  beforeEach(() => {
    ImpactService.clearHistory();
  });

  it('should initialize with realistic default history if localStorage is empty', () => {
    const history = ImpactService.getHistory();
    expect(history).toBeDefined();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty('itemName');
    expect(history[0]).toHaveProperty('co2SavedKg');
  });

  it('should verify standard carbon factors according to EPA/DEFRA methodology', () => {
    expect(ImpactService.CARBON_FACTORS['Plastic']).toBe(1.50);
    expect(ImpactService.CARBON_FACTORS['Metal']).toBe(9.00);
    expect(ImpactService.CARBON_FACTORS['Paper and cardboard']).toBe(1.05);
    expect(ImpactService.CARBON_FACTORS['Glass']).toBe(0.31);
    expect(ImpactService.CARBON_FACTORS['Organic / compostable']).toBe(0.52);
    expect(ImpactService.CARBON_FACTORS['Electronic waste']).toBe(2.20);
    expect(ImpactService.CARBON_FACTORS['Batteries']).toBe(2.50);
    expect(ImpactService.CARBON_FACTORS['General or non-recyclable waste']).toBe(0.0);
  });

  it('should accurately calculate CO2 avoided when an item is recyclable and sorted correctly', () => {
    const sampleItem: WasteClassification = {
      itemName: 'Clean Aluminum Can',
      category: 'Metal',
      confidence: 0.98,
      recyclable: true,
      instructions: ['Rinse and recycle'],
      disposalMethod: 'Curbside recycling container',
      specialHandling: false,
      estimatedWeightKg: 0.05,
    };

    const recorded = ImpactService.recordScan(sampleItem, true);
    // 0.05 kg * 9.00 factor = 0.45 kg CO2 saved
    expect(recorded.co2SavedKg).toBe(0.45);
    expect(recorded.sortedCorrectly).toBe(true);
    expect(recorded.recyclable).toBe(true);
  });

  it('should award 0 kg CO2 saved if the item was sorted incorrectly (contamination)', () => {
    const sampleItem: WasteClassification = {
      itemName: 'Greasy Cardboard Box',
      category: 'Paper and cardboard',
      confidence: 0.92,
      recyclable: true,
      instructions: ['Tear off grease stains'],
      disposalMethod: 'Curbside',
      specialHandling: false,
      estimatedWeightKg: 0.4,
    };

    const recorded = ImpactService.recordScan(sampleItem, false);
    expect(recorded.co2SavedKg).toBe(0);
    expect(recorded.sortedCorrectly).toBe(false);
  });

  it('should calculate cumulative metrics and environmental equivalencies correctly', () => {
    const metrics = ImpactService.calculateMetrics();

    expect(metrics).toHaveProperty('totalItemsScanned');
    expect(metrics).toHaveProperty('totalDivertedKg');
    expect(metrics).toHaveProperty('totalCo2SavedKg');
    expect(metrics).toHaveProperty('recyclingAccuracyRate');
    expect(metrics).toHaveProperty('treesEquivalent');
    expect(metrics).toHaveProperty('carMilesAvoided');
    expect(metrics).toHaveProperty('waterSavedLiters');
    expect(metrics.weeklyTrend).toHaveLength(7);

    // Tree equivalency formula: totalCo2 / 21.77
    const expectedTrees = parseFloat((metrics.totalCo2SavedKg / 21.77).toFixed(2));
    expect(metrics.treesEquivalent).toBeCloseTo(expectedTrees, 1);

    // Car miles avoided formula: totalCo2 / 0.404
    const expectedMiles = parseFloat((metrics.totalCo2SavedKg / 0.404).toFixed(1));
    expect(metrics.carMilesAvoided).toBeCloseTo(expectedMiles, 1);
  });

  it('should prepend newly recorded scans to the beginning of the history list', () => {
    const customItem: WasteClassification = {
      itemName: 'Test Scan Item',
      category: 'Glass',
      confidence: 0.99,
      recyclable: true,
      instructions: ['Wash glass'],
      disposalMethod: 'Glass bottle bank',
      specialHandling: false,
      estimatedWeightKg: 0.35,
    };

    const newEvent = ImpactService.recordScan(customItem, true);
    const history = ImpactService.getHistory();

    expect(history[0].id).toBe(newEvent.id);
    expect(history[0].itemName).toBe('Test Scan Item');
  });
});
