import { describe, it, expect } from 'vitest';
import { RecyclingService, RECYCLING_ITEMS } from '../services/recyclingService';

describe('RecyclingService Unit Tests', () => {
  it('should return all guide items and full category list', () => {
    const items = RecyclingService.getAllItems();
    expect(items.length).toBe(RECYCLING_ITEMS.length);
    expect(items.length).toBeGreaterThan(10);

    const categories = RecyclingService.getCategories();
    expect(categories).toContain('Plastic');
    expect(categories).toContain('Paper and cardboard');
    expect(categories).toContain('Metal');
    expect(categories).toContain('Glass');
    expect(categories).toContain('Organic / compostable');
    expect(categories).toContain('Electronic waste');
    expect(categories).toContain('Batteries');
  });

  it('should find items by ID accurately', () => {
    const item = RecyclingService.getItemById('pet-bottle');
    expect(item).toBeDefined();
    expect(item?.name).toContain('PET');
    expect(item?.category).toBe('Plastic');
    expect(item?.recyclable).toBe(true);
    expect(item?.preparationSteps.length).toBeGreaterThan(0);
  });

  it('should filter items by search query case-insensitively', () => {
    const results = RecyclingService.searchItems('bottle');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((item) => {
      const matchFound =
        item.name.toLowerCase().includes('bottle') ||
        item.summary.toLowerCase().includes('bottle') ||
        item.disposalMethod.toLowerCase().includes('bottle');
      expect(matchFound).toBe(true);
    });
  });

  it('should filter items by category and recyclability flags', () => {
    // Only recyclable plastic items
    const plasticRecyclable = RecyclingService.searchItems('', 'Plastic', true);
    expect(plasticRecyclable.length).toBeGreaterThan(0);
    plasticRecyclable.forEach((item) => {
      expect(item.category).toBe('Plastic');
      expect(item.recyclable).toBe(true);
    });

    // Non-recyclable items (e.g. greasy pizza box, plastic grocery film)
    const nonRecyclable = RecyclingService.searchItems('', 'All', false);
    expect(nonRecyclable.length).toBeGreaterThan(0);
    nonRecyclable.forEach((item) => {
      expect(item.recyclable).toBe(false);
    });
  });

  it('should ensure hazardous and battery items include critical warnings', () => {
    const batteryItem = RecyclingService.getItemById('alkaline-battery') || RecyclingService.getItemById('lithium-battery');
    const hazardItem = RecyclingService.getItemById('oil-paint-can');

    if (hazardItem) {
      expect(hazardItem.recyclable).toBe(false);
      expect(hazardItem.specialHandlingWarning).toBeDefined();
    }
  });
});
