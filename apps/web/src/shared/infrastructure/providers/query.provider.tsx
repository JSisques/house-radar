import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

export function QueryProvider({ client, children }: { client?: QueryClient; children: ReactNode }) {
  const [ownClient] = useState(createQueryClient);
  return <QueryClientProvider client={client ?? ownClient}>{children}</QueryClientProvider>;
}
