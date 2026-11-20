// Path: src/contexts/<context>/application/queries/<name>/<name>.handler.ts
// Reads only; never changes state. A missing entity is a typed exception,
// raised by an assert service, never a silent `null` returned to transport.
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AssertPropertyViewModelExistsService } from '@contexts/properties/application/services/read/assert-property-view-model-exists/assert-property-view-model-exists.service';
import { PropertyViewModel } from '@contexts/properties/domain/view-models/property.view-model';

import { PropertyFindByIdQuery } from './property-find-by-id.query';

@QueryHandler(PropertyFindByIdQuery)
export class PropertyFindByIdHandler implements IQueryHandler<PropertyFindByIdQuery, PropertyViewModel> {
  constructor(private readonly assertPropertyViewModelExists: AssertPropertyViewModelExistsService) {}

  async execute(query: PropertyFindByIdQuery): Promise<PropertyViewModel> {
    return this.assertPropertyViewModelExists.execute(query.id);
  }
}
