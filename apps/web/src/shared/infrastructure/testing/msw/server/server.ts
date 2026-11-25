import { setupServer } from 'msw/node';

import { handlers } from '@shared/infrastructure/testing/msw/handlers';

export const server = setupServer(...handlers);
