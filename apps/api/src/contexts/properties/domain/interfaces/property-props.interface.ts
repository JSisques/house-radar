import type { PropertyId } from '@house-radar/shared-kernel';

import type { IListingReferenceProps } from '@contexts/properties/domain/interfaces/listing-reference-props.interface';

/** What the aggregate constructor needs to hydrate a property. */
export interface IPropertyProps {
  id: PropertyId;
  listings: readonly IListingReferenceProps[];
}
