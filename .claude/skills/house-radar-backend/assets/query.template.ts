// Path: src/contexts/<context>/application/queries/<name>/<name>.query.ts
export interface PropertyFindByIdQueryInput {
  readonly id: string;
}

export class PropertyFindByIdQuery {
  readonly id: string;

  constructor(input: PropertyFindByIdQueryInput) {
    this.id = input.id;
  }
}
