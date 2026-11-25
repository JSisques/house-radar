import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { I18nPort } from '@shared/domain/i18n/i18n.port';
import {
  CompositionProvider,
  createAppPorts,
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

  it('fails loudly when a component is rendered outside the provider', () => {
    expect(() => render(<Title />)).toThrow(/CompositionProvider/);
  });
});
