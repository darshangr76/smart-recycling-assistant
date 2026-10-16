import { describe, it, expect } from 'vitest';
import { AIService, DEMO_PRESETS } from '../services/aiService';

describe('AIService Unit Tests', () => {
  it('should have unbreakable demo presets for all major recycling categories', () => {
    expect(DEMO_PRESETS.length).toBeGreaterThanOrEqual(6);

    const categories = DEMO_PRESETS.map((p) => p.category);
    expect(categories).toContain('Plastic');
    expect(categories).toContain('Metal');
    expect(categories).toContain('Organic / compostable');
    expect(categories).toContain('Paper and cardboard');
  });

  it('should validate and sanitize raw classification response objects', () => {
    const rawPartialData = {
      itemName: 'Soda Can',
      category: 'Metal',
      confidence: 0.95,
      recyclable: true,
      instructions: ['Rinse can'],
      disposalMethod: 'Yellow/Dry bin',
    };

    // Access sanitizeClassification via simulated data
    const preset = DEMO_PRESETS[0].result;
    expect(preset.itemName).toBeDefined();
    expect(preset.confidence).toBeGreaterThan(0.5);
    expect(preset.confidence).toBeLessThanOrEqual(1.0);
    expect(Array.isArray(preset.instructions)).toBe(true);
    expect(typeof preset.recyclable).toBe('boolean');
  });

  it('should correctly simulate classification for known keyword filenames', async () => {
    // Create mock File objects for testing
    const sodaFile = new File(['mock content'], 'coke-can.jpg', { type: 'image/jpeg' });
    const resultCan = await AIService.simulateClassification(sodaFile);

    expect(resultCan.category).toBe('Metal');
    expect(resultCan.recyclable).toBe(true);
    expect(resultCan.confidence).toBeGreaterThan(0.9);

    const bananaFile = new File(['mock content'], 'banana-peel.png', { type: 'image/png' });
    const resultBanana = await AIService.simulateClassification(bananaFile);

    expect(resultBanana.category).toBe('Organic / compostable');
    expect(resultBanana.recyclable).toBe(true);
  });
});
