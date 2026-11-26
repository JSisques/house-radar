import type { ProjectListingImportedCommand } from '@contexts/properties/application/commands/project-listing-imported/project-listing-imported.command';
import type { ProjectListingObservedCommand } from '@contexts/properties/application/commands/project-listing-observed/project-listing-observed.command';
import type { IProjectedListingProps } from '@contexts/properties/domain/interfaces/projected-listing-props.interface';

export const PROJECTED_LISTING_REPOSITORY_TOKEN = Symbol('PROJECTED_LISTING_REPOSITORY_TOKEN');

/**
 * Per-listing state as last applied by the projections. A change is applied only when it was observed after the state
 * already stored, so a late event never overwrites newer data.
 */
export interface IProjectedListingRepository {
  applyImported(command: ProjectListingImportedCommand): Promise<void>;
  applyObserved(command: ProjectListingObservedCommand): Promise<void>;
  /** The property that owns the listing, or null while the listing has none yet. */
  findPropertyIdOf(listingId: string): Promise<string | null>;
  /** The projected state of every listing of the property. */
  findByProperty(propertyId: string): Promise<IProjectedListingProps[]>;
  listPropertyIds(): Promise<string[]>;
}
