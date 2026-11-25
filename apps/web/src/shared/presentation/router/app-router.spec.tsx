import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createAppRouter } from './app-router';

function renderAt(url: string) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [url] }));
  render(<RouterProvider router={router} />);
}

describe('createAppRouter', () => {
  it('should render the home page at the root path', async () => {
    renderAt('/');

    expect(await screen.findByRole('heading', { name: 'House Radar' })).toBeInTheDocument();
  });

  it('should render the not-found route for an unknown path', async () => {
    renderAt('/this/does/not/exist');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  });
});
