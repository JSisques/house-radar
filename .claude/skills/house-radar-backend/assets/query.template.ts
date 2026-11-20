// Path: src/contexts/<context>/application/queries/<name>/<name>.query.ts
// The input carries primitives; the query carries value objects.
import { PropertyId } from '@house-radar/shared-kernel';

export interface PropertyFindByIdQueryInput {
  readonly id: string;
}

export class PropertyFindByIdQuery {
  readonly id: PropertyId;

  constructor(input: PropertyFindByIdQueryInput) {
    this.id = new PropertyId(input.id);
  }
}
