import type { es } from '@shared/domain/i18n/locales/es/common.locale';

export type Locale = 'es' | 'en';

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/** Shape every locale catalog must have; `es` is the source of truth. */
export type Translations = Widen<typeof es>;

type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Dot-separated key of the catalog, e.g. `app.title`. */
export type TranslationKey = Paths<Translations>;

export interface I18nPort {
  readonly locale: Locale;
  t(key: TranslationKey): string;
  formatPrice(amountInEur: number): string;
  formatArea(squareMeters: number): string;
}
