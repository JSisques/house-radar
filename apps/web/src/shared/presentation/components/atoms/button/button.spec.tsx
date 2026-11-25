import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('should render its label', () => {
    render(<Button label="Search" onClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button label="Search" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
