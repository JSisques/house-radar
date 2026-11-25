import createClient from 'openapi-fetch';

import type { paths } from '@shared/domain/http-client/api-schema/api-schema';
import type { HttpClientPort } from '@shared/domain/http-client/http-client.port';

interface LooseRequest {
  request(
    method: string,
    path: string,
    init: { params?: unknown; body?: unknown; signal?: AbortSignal },
  ): Promise<{ data?: unknown; error?: unknown; response: Response }>;
}

/** `HttpClientPort` over `openapi-fetch`; `fetch` is injectable for tests. */
export function createOpenApiFetchAdapter(options: { baseUrl: string; fetch?: typeof fetch }): HttpClientPort {
  // `fetch` is resolved per call so MSW and other global patches keep working.
  const client = createClient<paths>({
    baseUrl: options.baseUrl,
    fetch: options.fetch ?? ((request) => globalThis.fetch(request)),
  }) as unknown as LooseRequest;

  return {
    // The public signature carries the contract types; the cast stays inside this adapter.
    request: (async (
      method: string,
      path: string,
      init: { params?: unknown; body?: unknown; signal?: AbortSignal } = {},
    ) => {
      const { data, error, response } = await client.request(method.toUpperCase(), path, init);
      return { status: response.status, data: response.ok ? data : error };
    }) as HttpClientPort['request'],
  };
}
