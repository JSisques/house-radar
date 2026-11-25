import { setupWorker } from 'msw/browser';

import { handlers } from '@shared/infrastructure/testing/msw/handlers';

export const worker = setupWorker(...handlers);
