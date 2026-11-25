import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { CompositionProvider, createAppPorts } from '@shared/infrastructure/providers/composition/composition.provider';
import { QueryProvider } from '@shared/infrastructure/providers/query/query.provider';
import { createAppRouter } from '@shared/presentation/router/app-router/app-router';

const router = createAppRouter();
const ports = await createAppPorts();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CompositionProvider ports={ports}>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </CompositionProvider>
  </StrictMode>,
);
