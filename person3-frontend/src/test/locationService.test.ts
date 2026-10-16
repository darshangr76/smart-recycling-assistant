import { describe, it, expect } from 'vitest';
import { LocationService, POPULAR_CITIES, SAMPLE_CENTERS } from '../services/locationService';

describe('LocationService Unit Tests', () => {
  it('should expose popular city presets with coordinates', () => {
    expect(POPULAR_CITIES.length).toBeGreaterThan(5);
    const blr = POPULAR_CITIES.find((c) => c.id === 'bengaluru');
    expect(blr).toBeDefined();
    expect(blr?.lat).toBeCloseTo(12.9716, 2);
    expect(blr?.lng).toBeCloseTo(77.5946, 2);
  });

  it('should compute distance in kilometers using the Haversine formula', () => {
    // Distance between Bengaluru (12.9716, 77.5946) and Mumbai (19.0760, 72.8777) is ~840-850 km
    const distance = LocationService.calculateDistanceKm(12.9716, 77.5946, 19.0760, 72.8777);
    expect(distance).toBeGreaterThan(800);
    expect(distance).toBeLessThan(900);

    // Distance to same point should be 0
    const zeroDistance = LocationService.calculateDistanceKm(12.9716, 77.5946, 12.9716, 77.5946);
    expect(zeroDistance).toBe(0);
  });

  it('should sort centers by proximity to the user coordinates', () => {
    // User in Bengaluru center
    const centers = LocationService.getCenters(12.9716, 77.5946);
    expect(centers.length).toBeGreaterThan(0);

    // Closest center should be within 20 km of Bengaluru center
    expect(centers[0].distanceKm).toBeLessThan(20);

    // Distances should be in ascending order
    for (let i = 1; i < centers.length; i++) {
      expect((centers[i].distanceKm ?? 0)).toBeGreaterThanOrEqual(centers[i - 1].distanceKm ?? 0);
    }
  });

  it('should filter centers by accepted waste category', () => {
    const batteryCenters = LocationService.getCenters(12.9716, 77.5946, {
      categoryFilter: 'Batteries',
    });

    expect(batteryCenters.length).toBeGreaterThan(0);
    batteryCenters.forEach((center) => {
      expect(center.categoriesAccepted).toContain('Batteries');
    });
  });

  it('should generate properly encoded Google Maps directions URL', () => {
    const url = LocationService.getDirectionsUrl(12.9784, 77.6408, 'Hasiru Dala DWCC');
    expect(url).toContain('https://www.google.com/maps/dir/');
    expect(url).toContain('12.9784,77.6408');
    expect(url).toContain(encodeURIComponent('Hasiru Dala DWCC'));
  });
});
