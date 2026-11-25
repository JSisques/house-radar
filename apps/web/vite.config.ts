import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Mirrors the `@contexts/*`, `@core/*` and `@shared/*` paths of tsconfig.base.json.
export const aliases = {
  '@contexts': `${import.meta.dirname}/src/contexts`,
  '@core': `${import.meta.dirname}/src/core`,
  '@shared': `${import.meta.dirname}/src/shared`,
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias: aliases },
});
