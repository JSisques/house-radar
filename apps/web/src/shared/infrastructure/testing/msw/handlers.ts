import { http, HttpResponse } from 'msw';

/** Default API mocks shared by Vitest and Storybook. Override per spec or story with `server.use` / `parameters.msw`. */
export const handlers = [http.get('*/api/health', () => HttpResponse.json({ status: 'ok' }))];
