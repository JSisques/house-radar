// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'House Radar',
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
