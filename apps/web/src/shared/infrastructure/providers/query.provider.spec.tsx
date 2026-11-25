import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createQueryClient, QueryProvider } from './query.provider';

function ClientProbe({ expected }: { expected: QueryClient }) {
  return <p>{useQueryClient() === expected ? 'same client' : 'other client'}</p>;
}

function QueryProbe() {
  const { data } = useQuery({ queryKey: ['probe'], queryFn: () => 'loaded' });
  return <p>{data ?? 'loading'}</p>;
}

describe('QueryProvider', () => {
  it('should expose the injected client to its children', () => {
    const client = createQueryClient();

    render(
      <QueryProvider client={client}>
        <ClientProbe expected={client} />
      </QueryProvider>,
    );

    expect(screen.getByText('same client')).toBeInTheDocument();
  });

  it('should create its own client when none is injected', async () => {
    render(
      <QueryProvider>
        <QueryProbe />
      </QueryProvider>,
    );

    expect(await screen.findByText('loaded')).toBeInTheDocument();
  });
});

describe('createQueryClient', () => {
  it('should not retry failed queries by default so errors surface quickly', () => {
    expect(createQueryClient().getDefaultOptions().queries?.retry).toBe(false);
  });
});
