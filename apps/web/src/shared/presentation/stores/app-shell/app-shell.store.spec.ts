import { beforeEach, describe, expect, it } from 'vitest';

import { useAppShellStore } from './app-shell.store';

describe('useAppShellStore', () => {
  beforeEach(() => {
    useAppShellStore.setState(useAppShellStore.getInitialState());
  });

  it('should start with the navigation closed', () => {
    expect(useAppShellStore.getState().isNavOpen).toBe(false);
  });

  describe('toggleNav', () => {
    it('should open and close the navigation', () => {
      useAppShellStore.getState().toggleNav();
      expect(useAppShellStore.getState().isNavOpen).toBe(true);

      useAppShellStore.getState().toggleNav();
      expect(useAppShellStore.getState().isNavOpen).toBe(false);
    });
  });
});
