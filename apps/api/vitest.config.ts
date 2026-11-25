import swc from 'unplugin-swc';

import { defineKindConfig } from '../../vitest.shared.ts';

// NestJS needs decorator metadata, which esbuild does not emit (D14): compile specs with SWC.
export default defineKindConfig('unit', { plugins: [swc.vite()] });
