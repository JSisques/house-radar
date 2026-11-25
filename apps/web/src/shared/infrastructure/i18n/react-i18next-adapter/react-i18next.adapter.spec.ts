import { describe, expect, it } from 'vitest';

import { en } from '@shared/domain/i18n/locales/en/common.locale';
import { es } from '@shared/domain/i18n/locales/es/common.locale';
import { createReactI18nextAdapter } from '@shared/infrastructure/i18n/react-i18next-adapter/react-i18next.adapter';

function flatKeys(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null ? flatKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

describe('createReactI18nextAdapter', () => {
  it('defaults to Spanish', async () => {
    const i18n = await createReactI18nextAdapter();

    expect(i18n.locale).toBe('es');
    expect(i18n.t('app.title')).toBe(es.app.title);
  });

  it('translates in English when asked', async () => {
    const i18n = await createReactI18nextAdapter('en');

    expect(i18n.t('app.title')).toBe(en.app.title);
  });

  it('formats 200000 EUR in the Spanish format', async () => {
    const i18n = await createReactI18nextAdapter('es');

    expect(i18n.formatPrice(200000).replace(/\s/g, ' ')).toBe('200.000 €');
  });

  it('formats areas in square meters in the Spanish locale', async () => {
    const i18n = await createReactI18nextAdapter('es');

    expect(i18n.formatArea(85.5).replace(/\s/g, ' ')).toBe('85,5 m²');
  });

  it('keeps locale parity: en has exactly the keys of es', () => {
    expect(flatKeys(en).sort()).toEqual(flatKeys(es).sort());
  });

  it('rejects keys missing from the catalog at compile time', async () => {
    const i18n = await createReactI18nextAdapter();

    // @ts-expect-error missing translation key must not typecheck
    i18n.t('app.doesNotExist');
  });
});
