import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable } from '@nestjs/common';

import type { IPropertySearchViewRepository } from '@contexts/properties/application/ports/property-search-view-repository.port';
import type { IPropertySearchViewModel } from '@contexts/properties/application/view-models/property-search-view/property-search-view.view-model';
import { PROPERTY_SEARCH_VIEW_ENTITY } from '@contexts/properties/infrastructure/persistence/mikro-orm/schemas/property-search-view.schema';

/** Upserts the view of a property into `properties.property_search_view`, in the ambient transaction. */
@Injectable()
export class PropertySearchViewMikroOrmRepository implements IPropertySearchViewRepository {
  constructor(@Inject(EntityManager) private readonly em: EntityManager) {}

  async save(view: IPropertySearchViewModel): Promise<void> {
    await this.em.upsert(PROPERTY_SEARCH_VIEW_ENTITY, {
      ...view,
      features: { ...view.features },
      conflicts: { ...view.conflicts },
      lastUpdatedAt: new Date(),
    });
  }
}
