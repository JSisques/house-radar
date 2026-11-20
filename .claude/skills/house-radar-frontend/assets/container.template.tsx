// Path: src/contexts/<context>/presentation/containers/<name>/<name>.container.tsx
// Container: gets data and handlers from hooks, renders a presentational component. No markup logic.
import { useSearchProperties } from '@contexts/search/presentation/hooks/use-search-properties.hook';
import { PropertyList } from '@contexts/search/presentation/components/property-list/property-list.component';

export function PropertyListContainer() {
  const { data, isPending, error } = useSearchProperties({});

  return <PropertyList properties={data ?? []} isLoading={isPending} error={error} />;
}
