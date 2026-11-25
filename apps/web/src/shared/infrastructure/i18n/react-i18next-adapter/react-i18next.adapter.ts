import { createInstance } from 'i18next';

import type { I18nPort, Locale } from '@shared/domain/i18n/i18n.port';
import { en } from '@shared/domain/i18n/locales/en/common.locale';
import { es } from '@shared/domain/i18n/locales/es/common.locale';

const NBSP = String.fromCharCode(160);
const INTL_LOCALES: Record<Locale, string> = { es: 'es-ES', en: 'en-GB' };

export async function createReactI18nextAdapter(locale: Locale = 'es'): Promise<I18nPort> {
  const instance = createInstance();
  await instance.init({
    lng: locale,
    fallbackLng: 'es',
    defaultNS: 'common',
    resources: { es: { common: es }, en: { common: en } },
    interpolation: { escapeValue: false },
  });

  const intlLocale = INTL_LOCALES[locale];
  const price = new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  // Intl has no square-meter unit, so the number is localized and the symbol appended.
  const area = new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 2 });

  return {
    locale,
    t: (key) => instance.t(key),
    formatPrice: (amount) => price.format(amount),
    formatArea: (squareMeters) => `${area.format(squareMeters)}${NBSP}m²`,
  };
}
