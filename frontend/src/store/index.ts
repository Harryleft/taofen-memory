import { create } from 'zustand'

interface AppState {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}))

// Redux store placeholder for compatibility
export const store = {
  dispatch: () => {},
  getState: () => ({}),
  subscribe: () => () => {},
}