// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [
    starlight({
      title: 'House Radar',
      // Visual direction "Folla catastral" (ADR D34): self-hosted fonts + theme tokens.
      customCss: [
        '@fontsource/public-sans/400.css',
        '@fontsource/public-sans/600.css',
        '@fontsource/schibsted-grotesk/700.css',
        '@fontsource/schibsted-grotesk/800.css',
        '@fontsource/ibm-plex-mono/400.css',
        '@fontsource/ibm-plex-mono/500.css',
        './src/styles/theme.css',
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
      },
      sidebar: [
        {
          label: 'Product',
          translations: { es: 'Producto' },
          items: [{ autogenerate: { directory: 'product' } }],
        },
        {
          label: 'Features',
          translations: { es: 'Funcionalidades' },
          items: [{ autogenerate: { directory: 'features' } }],
        },
        {
          label: 'Architecture',
          translations: { es: 'Arquitectura' },
          items: [{ autogenerate: { directory: 'architecture' } }],
        },
        {
          label: 'ADR',
          translations: { es: 'ADR' },
          items: [{ autogenerate: { directory: 'adr' } }],
        },
        {
          label: 'Domain',
          translations: { es: 'Dominio' },
          items: [{ autogenerate: { directory: 'domain' } }],
        },
        {
          label: 'Sources',
          translations: { es: 'Fuentes' },
          items: [{ autogenerate: { directory: 'sources' } }],
        },
        {
          label: 'Operations',
          translations: { es: 'Operaciones' },
          items: [{ autogenerate: { directory: 'operations' } }],
        },
      ],
    }),
  ],
});
