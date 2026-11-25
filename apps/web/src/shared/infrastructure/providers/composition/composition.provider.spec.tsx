import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { HttpClientPort } from '@shared/domain/http-client/http-client.port';
import type { I18nPort } from '@shared/domain/i18n/i18n.port';
import {
  CompositionProvider,
  createAppPorts,
  useHttpClient,
  useI18n,
} from '@shared/infrastructure/providers/composition/composition.provider';

function Title() {
  const i18n = useI18n();
  return <h1>{i18n.t('app.title')}</h1>;
}

const fakeI18n: I18nPort = {
  locale: 'es',
  t: () => 'fake title',
  formatPrice: () => 'fake price',
  formatArea: () => 'fake area',
};

describe('CompositionProvider', () => {
  it('wires the real adapters by default', async () => {
    const ports = await createAppPorts();

    render(
      <CompositionProvider ports={ports}>
        <Title />
      </CompositionProvider>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('House Radar');
  });

  it('lets a test swap an adapter so components use the fake', async () => {
    const ports = await createAppPorts({ i18n: fakeI18n });

    render(
      <CompositionProvider ports={ports}>
        <Title />
      </CompositionProvider>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('fake title');
  });

  it('lets a test swap the HTTP client without touching components', async () => {
    const fakeHttp: HttpClientPort = {
      request: () => Promise.resolve({ status: 200, data: { status: 'ok', details: {} } }) as never,
    };
    const ports = await createAppPorts({ httpClient: fakeHttp });
    let used: HttpClientPort | undefined;
    function Probe() {
      used = useHttpClient();
      return null;
    }

    render(
      <CompositionProvider ports={ports}>
        <Probe />
      </CompositionProvider>,
    );

    expect(used).toBe(fakeHttp);
  });

  it('fails loudly when a component is rendered outside the provider', () => {
    expect(() => render(<Title />)).toThrow(/CompositionProvider/);
  });
});
