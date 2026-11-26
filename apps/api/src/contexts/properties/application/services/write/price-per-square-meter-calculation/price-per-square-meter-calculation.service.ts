import { Injectable } from '@nestjs/common';

import { IService } from '@house-radar/building-blocks';
import { Area, isKnown, known, Money, PricePerSquareMeter } from '@house-radar/shared-kernel';

export interface IPricePerSquareMeterCalculationServiceInput {
  priceCents: number | null;
  builtAreaM2: number | null;
}

/**
 * D20: the price per m2 uses the built area only; without it, or without a price, it is unknown. The calculation is
 * the one of the shared kernel; this service only guards the raw numbers of a projection, which must never throw.
 */
@Injectable()
export class PricePerSquareMeterCalculationService implements IService<
  IPricePerSquareMeterCalculationServiceInput,
  number | null
> {
  execute({ priceCents, builtAreaM2 }: IPricePerSquareMeterCalculationServiceInput): number | null {
    if (priceCents === null || priceCents <= 0 || builtAreaM2 === null || builtAreaM2 <= 0) return null;
    const builtArea = known(new Area(builtAreaM2), 'declared');
    const pricePerSquareMeter = PricePerSquareMeter.calculate(new Money(priceCents), builtArea);
    return isKnown(pricePerSquareMeter) ? pricePerSquareMeter.value.toPrimitives() : null;
  }
}
