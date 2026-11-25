export function createQueryKeys<const Scope extends string>(scope: Scope) {
  return {
    all: [scope] as const,
    lists: () => [scope, 'list'] as const,
    list: <Filters>(filters: Filters) => [scope, 'list', filters] as const,
    details: () => [scope, 'detail'] as const,
    detail: (id: string) => [scope, 'detail', id] as const,
  };
}
