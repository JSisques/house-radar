import { http, HttpResponse } from 'msw';
import { describe, expect, expectTypeOf, it } from 'vitest';

import type { ApiResult } from '@shared/domain/http-client/http-client.port';
import { createOpenApiFetchAdapter } from '@shared/infrastructure/http-client/openapi-fetch-adapter/openapi-fetch.adapter';
import { server } from '@shared/infrastructure/testing/msw/server/server';

const client = createOpenApiFetchAdapter({ baseUrl: 'http://api.test' });

describe('createOpenApiFetchAdapter', () => {
  it('returns the typed body and status of a declared response', async () => {
    server.use(http.get('http://api.test/api/health', () => HttpResponse.json({ status: 'ok', details: {} })));

    const result = await client.request('get', '/api/health');

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ status: 'ok', details: {} });
  });

  it('narrows the body by status', async () => {
    server.use(
      http.get('http://api.test/api/health', () =>
        HttpResponse.json({ status: 'error', details: {}, error: {} }, { status: 503 }),
      ),
    );

    const result = await client.request('get', '/api/health');

    expect(result.status).toBe(503);
    if (result.status === 503) expect(result.data.status).toBe('error');
    expectTypeOf<ApiResult<'get', '/api/health'>['status']>().toEqualTypeOf<200 | 503>();
  });

  it('rejects paths and methods outside the contract at compile time', async () => {
    server.use(http.get('http://api.test/api/health', () => HttpResponse.json({ status: 'ok', details: {} })));

    // @ts-expect-error `/api/unknown` is not in the generated contract
    const unknownPath = client.request('get', '/api/unknown');
    // @ts-expect-error `/api/health` declares no POST
    const unknownMethod = client.request('post', '/api/health');

    await Promise.allSettled([unknownPath, unknownMethod]);
  });
});
