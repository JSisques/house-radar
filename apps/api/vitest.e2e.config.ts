import swc from 'unplugin-swc';

import { defineKindConfig } from '../../vitest.shared.ts';

export default defineKindConfig('e2e', { plugins: [swc.vite()] });
