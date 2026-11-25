import type { Translations } from '@shared/domain/i18n/i18n.port';

// Stub: same shape as `es`, so a missing key fails typechecking.
export const en: Translations = {
  app: {
    title: 'House Radar',
    notFound: 'Page not found',
    backToHome: 'Back to home',
  },
};
