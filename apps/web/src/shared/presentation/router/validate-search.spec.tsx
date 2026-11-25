import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useSearch,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { validateSearch } from './validate-search';

const filtersSchema = z.object({
  minPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['price', 'date']).default('date'),
});

function SearchPage() {
  const { sort } = useSearch({ strict: false }) as z.output<typeof filtersSchema>;
  return <p>sorted by {sort}</p>;
}

describe('validateSearch', () => {
  const validate = validateSearch(filtersSchema);

  it('should return the typed params and apply defaults', () => {
    expect(validate({ minPrice: '1500' })).toEqual({ minPrice: 1500, sort: 'date' });
  });

  it('should reject params that fail the schema', () => {
    expect(() => validate({ minPrice: '-5' })).toThrow();
    expect(() => validate({ sort: 'size' })).toThrow();
  });

  describe('inside a route', () => {
    function renderAt(url: string) {
      const rootRoute = createRootRoute();
      const searchRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/search',
        validateSearch: validate,
        component: SearchPage,
        errorComponent: () => <p>invalid search params</p>,
      });
      const router = createRouter({
        routeTree: rootRoute.addChildren([searchRoute]),
        history: createMemoryHistory({ initialEntries: [url] }),
      });
      render(<RouterProvider router={router} />);
    }

    it('should render the route with valid params', async () => {
      renderAt('/search?sort=price');

      expect(await screen.findByText('sorted by price')).toBeInTheDocument();
    });

    it('should render the error component with invalid params', async () => {
      renderAt('/search?sort=size');

      expect(await screen.findByText('invalid search params')).toBeInTheDocument();
    });
  });
});
