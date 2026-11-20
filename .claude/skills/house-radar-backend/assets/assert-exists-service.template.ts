// Path: src/contexts/<context>/application/services/read/assert-<name>-view-model-exists/assert-<name>-view-model-exists.service.ts
// Handlers use assert services instead of find-then-throw. The write-side twin
// lives in services/write/ and returns the aggregate.
import { Inject, Injectable } from '@nestjs/common';

import { PropertyId } from '@house-radar/shared-kernel';

import { PropertyNotFoundException } from '@contexts/properties/domain/exceptions/property-not-found/property-not-found.exception';
import {
  IPropertyReadRepository,
  PROPERTY_READ_REPOSITORY_TOKEN,
} from '@contexts/properties/domain/repositories/read/property-read.repository';
import { PropertyViewModel } from '@contexts/properties/domain/view-models/property.view-model';

@Injectable()
export class AssertPropertyViewModelExistsService {
  constructor(
    @Inject(PROPERTY_READ_REPOSITORY_TOKEN)
    private readonly propertyReadRepository: IPropertyReadRepository,
  ) {}

  async execute(id: PropertyId): Promise<PropertyViewModel> {
    const property = await this.propertyReadRepository.findById(id);
    if (!property) {
      throw new PropertyNotFoundException(id);
    }
    return property;
  }
}
