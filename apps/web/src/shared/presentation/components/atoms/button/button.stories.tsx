import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Button } from './button';

const meta = { title: 'Atoms/Button', component: Button, args: { label: 'Search', onClick: fn() } } satisfies Meta<
  typeof Button
>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
