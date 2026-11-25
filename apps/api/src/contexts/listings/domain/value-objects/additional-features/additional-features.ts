import {
  type EnergyCertificate,
  type Maybe,
  type MaybePrimitives,
  maybeToPrimitives,
  UNKNOWN,
} from '@house-radar/shared-kernel';

import type { IAdditionalFeaturesProps } from '@contexts/listings/domain/interfaces/additional-features-props.interface';
import type { LandType } from '@contexts/listings/domain/value-objects/land-type/land-type.value-object';

export interface IAdditionalFeaturesPrimitives {
  garage: MaybePrimitives<boolean>;
  garden: MaybePrimitives<boolean>;
  swimmingPool: MaybePrimitives<boolean>;
  terrace: MaybePrimitives<boolean>;
  balcony: MaybePrimitives<boolean>;
  heating: MaybePrimitives<boolean>;
  elevator: MaybePrimitives<boolean>;
  energyCertificate: MaybePrimitives<string>;
  landType: MaybePrimitives<string>;
  water: MaybePrimitives<boolean>;
  electricity: MaybePrimitives<boolean>;
  sanitation: MaybePrimitives<boolean>;
}

const asIs = <T>(value: T): T => value;

/**
 * The additional features of HR-F002-BR3. Every one is unknown unless stated: a missing datum
 * never means the property lacks the feature (HR-F002-BR4).
 */
export class AdditionalFeatures {
  readonly garage: Maybe<boolean>;
  readonly garden: Maybe<boolean>;
  readonly swimmingPool: Maybe<boolean>;
  readonly terrace: Maybe<boolean>;
  readonly balcony: Maybe<boolean>;
  readonly heating: Maybe<boolean>;
  readonly elevator: Maybe<boolean>;
  readonly energyCertificate: Maybe<EnergyCertificate>;
  readonly landType: Maybe<LandType>;
  readonly water: Maybe<boolean>;
  readonly electricity: Maybe<boolean>;
  readonly sanitation: Maybe<boolean>;

  constructor(props: Partial<IAdditionalFeaturesProps> = {}) {
    this.garage = props.garage ?? UNKNOWN;
    this.garden = props.garden ?? UNKNOWN;
    this.swimmingPool = props.swimmingPool ?? UNKNOWN;
    this.terrace = props.terrace ?? UNKNOWN;
    this.balcony = props.balcony ?? UNKNOWN;
    this.heating = props.heating ?? UNKNOWN;
    this.elevator = props.elevator ?? UNKNOWN;
    this.energyCertificate = props.energyCertificate ?? UNKNOWN;
    this.landType = props.landType ?? UNKNOWN;
    this.water = props.water ?? UNKNOWN;
    this.electricity = props.electricity ?? UNKNOWN;
    this.sanitation = props.sanitation ?? UNKNOWN;
  }

  static unknown(): AdditionalFeatures {
    return new AdditionalFeatures();
  }

  toPrimitives(): IAdditionalFeaturesPrimitives {
    return {
      garage: maybeToPrimitives(this.garage, asIs),
      garden: maybeToPrimitives(this.garden, asIs),
      swimmingPool: maybeToPrimitives(this.swimmingPool, asIs),
      terrace: maybeToPrimitives(this.terrace, asIs),
      balcony: maybeToPrimitives(this.balcony, asIs),
      heating: maybeToPrimitives(this.heating, asIs),
      elevator: maybeToPrimitives(this.elevator, asIs),
      energyCertificate: maybeToPrimitives(this.energyCertificate, (v) => v.value),
      landType: maybeToPrimitives(this.landType, (v) => v.value),
      water: maybeToPrimitives(this.water, asIs),
      electricity: maybeToPrimitives(this.electricity, asIs),
      sanitation: maybeToPrimitives(this.sanitation, asIs),
    };
  }
}
