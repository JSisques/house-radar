import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useEffect, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { server } from '@shared/infrastructure/testing/msw/server/server';

function HealthProbe() {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    void fetch('http://localhost/api/health')
      .then((response) => response.json() as Promise<{ status: string }>)
      .then((body) => setStatus(body.status))
      .catch(() => setStatus('failed'));
  }, []);
  return <p>{status}</p>;
}

describe('msw server', () => {
  it('should answer a component request with the default handlers', async () => {
    render(<HealthProbe />);

    expect(await screen.findByText('ok')).toBeInTheDocument();
  });

  it('should answer with a handler overridden for one spec', async () => {
    server.use(http.get('http://localhost/api/health', () => HttpResponse.json({ status: 'degraded' })));

    render(<HealthProbe />);

    expect(await screen.findByText('degraded')).toBeInTheDocument();
  });

  it('should reject a request nobody handled', async () => {
    await expect(fetch('http://localhost/api/unhandled')).rejects.toThrow();
  });
});
