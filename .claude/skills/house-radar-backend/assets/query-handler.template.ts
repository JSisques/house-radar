// Path: src/contexts/<context>/application/queries/<name>/<name>.handler.ts
// Reads only; never changes state.
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  IPropertyReadRepository,
  PROPERTY_READ_REPOSITORY_TOKEN,
} from '@contexts/properties/domain/repositories/property-read.repository';
import { PropertyViewModel } from '@contexts/properties/domain/view-models/property.view-model';

import { PropertyFindByIdQuery } from './property-find-by-id.query';

@QueryHandler(PropertyFindByIdQuery)
export class PropertyFindByIdHandler implements IQueryHandler<PropertyFindByIdQuery, PropertyViewModel> {
  constructor(
    @Inject(PROPERTY_READ_REPOSITORY_TOKEN)
    private readonly propertyReadRepository: IPropertyReadRepository,
  ) {}

  async execute(query: PropertyFindByIdQuery): Promise<PropertyViewModel> {
    return this.propertyReadRepository.findById(query.id);
  }
}
