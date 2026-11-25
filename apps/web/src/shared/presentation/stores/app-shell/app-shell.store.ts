import { create } from 'zustand';

interface AppShellState {
  isNavOpen: boolean;
  toggleNav: () => void;
}

export const useAppShellStore = create<AppShellState>((set) => ({
  isNavOpen: false,
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
}));
