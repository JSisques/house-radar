// Path: src/contexts/<context>/application/query-keys/<context>.query-keys.ts
import type { SearchFilters } from '@contexts/search/domain/repositories/property-search.repository.port';

export const searchQueryKeys = {
  all: ['search'] as const,
  lists: () => [...searchQueryKeys.all, 'list'] as const,
  list: (filters: SearchFilters) => [...searchQueryKeys.lists(), filters] as const,
  detail: (id: string) => [...searchQueryKeys.all, 'detail', id] as const,
};
