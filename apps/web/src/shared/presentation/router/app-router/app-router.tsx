import { createRootRoute, createRoute, createRouter, Link, Outlet, type RouterHistory } from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Back to home</Link>
    </main>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <main>
      <h1>House Radar</h1>
    </main>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute]);

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
