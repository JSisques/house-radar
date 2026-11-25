import type { EnergyCertificate, Maybe } from '@house-radar/shared-kernel';

import type { LandType } from '@contexts/listings/domain/value-objects/land-type/land-type.value-object';

export interface IAdditionalFeaturesProps {
  garage: Maybe<boolean>;
  garden: Maybe<boolean>;
  swimmingPool: Maybe<boolean>;
  terrace: Maybe<boolean>;
  balcony: Maybe<boolean>;
  heating: Maybe<boolean>;
  elevator: Maybe<boolean>;
  energyCertificate: Maybe<EnergyCertificate>;
  landType: Maybe<LandType>;
  water: Maybe<boolean>;
  electricity: Maybe<boolean>;
  sanitation: Maybe<boolean>;
}
