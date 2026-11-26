import { Injectable } from '@nestjs/common';

import { Area, isKnown, known, Money, PricePerSquareMeter } from '@house-radar/shared-kernel';

/**
 * D20: the price per m2 uses the built area only; without it, or without a price, it is unknown. The calculation is
 * the one of the shared kernel; this service only guards the raw numbers of a projection, which must never throw.
 */
@Injectable()
export class PricePerSquareMeterCalculationService {
  /** Euro cents per m2, or null when it is unknown. */
  calculate(priceCents: number | null, builtAreaM2: number | null): number | null {
    if (priceCents === null || priceCents <= 0 || builtAreaM2 === null || builtAreaM2 <= 0) return null;
    const builtArea = known(new Area(builtAreaM2), 'declared');
    const pricePerSquareMeter = PricePerSquareMeter.calculate(new Money(priceCents), builtArea);
    return isKnown(pricePerSquareMeter) ? pricePerSquareMeter.value.toPrimitives() : null;
  }
}
