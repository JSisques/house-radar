import { describe, expect, it } from 'vitest';

import { PricePerSquareMeterCalculationService } from '@contexts/properties/application/services/write/price-per-square-meter-calculation/price-per-square-meter-calculation.service';

describe('PricePerSquareMeterCalculationService', () => {
  const service = new PricePerSquareMeterCalculationService();

  describe('execute', () => {
    it('should divide the price by the built area (HR-F002-AC3)', () => {
      expect(service.execute({ priceCents: 20_000_000, builtAreaM2: 100 })).toBe(200_000);
    });

    it('should round to whole cents', () => {
      expect(service.execute({ priceCents: 10_000_001, builtAreaM2: 3 })).toBe(3_333_334);
    });

    it('should be unknown without a built area, as with only the usable area (HR-F002-AC4)', () => {
      expect(service.execute({ priceCents: 20_000_000, builtAreaM2: null })).toBeNull();
    });

    it('should be unknown without a price', () => {
      expect(service.execute({ priceCents: null, builtAreaM2: 100 })).toBeNull();
    });

    it('should be unknown for a price or an area that is not positive', () => {
      expect(service.execute({ priceCents: 0, builtAreaM2: 100 })).toBeNull();
      expect(service.execute({ priceCents: 20_000_000, builtAreaM2: 0 })).toBeNull();
      expect(service.execute({ priceCents: 20_000_000, builtAreaM2: -5 })).toBeNull();
    });
  });
});
