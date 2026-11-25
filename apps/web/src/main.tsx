import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { QueryProvider } from '@shared/infrastructure/providers/query/query.provider';
import { createAppRouter } from '@shared/presentation/router/app-router/app-router';

const router = createAppRouter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </StrictMode>,
);
