// Path: src/contexts/<context>/presentation/hooks/use-search-properties.hook.ts
// Only bridge from presentation to application. Server data lives in TanStack Query only.
import { useQuery } from '@tanstack/react-query';

import { searchQueryKeys } from '@contexts/search/application/query-keys/search.query-keys';
import { useSearchUseCases } from '@contexts/search/infrastructure/providers/search.provider';
import type { SearchFilters } from '@contexts/search/domain/models/search-filters.model';

export function useSearchProperties(filters: SearchFilters) {
  const { searchProperties } = useSearchUseCases();

  return useQuery({
    queryKey: searchQueryKeys.list(filters),
    queryFn: () => searchProperties.execute(filters),
  });
}
