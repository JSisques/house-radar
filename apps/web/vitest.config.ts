import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vitest/config';

import { defineKindConfig } from '../../vitest.shared.ts';
import { aliases } from './vite.config.ts';

export default mergeConfig(defineKindConfig('unit', { plugins: [react()] }), {
  resolve: { alias: aliases },
  test: { environment: 'jsdom', setupFiles: ['./src/vitest.setup.ts'] },
});
