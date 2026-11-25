import type { Preview } from '@storybook/react-vite';
import { mswLoader } from 'msw-storybook-addon/csf3';

import { handlers } from '@shared/infrastructure/testing/msw/handlers';

const preview: Preview = {
  loaders: [mswLoader()],
  parameters: { msw: [...handlers] },
};

export default preview;
