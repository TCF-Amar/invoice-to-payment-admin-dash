import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  jwtSecret: string;
  setJwtSecret: (secret: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      theme: 'dark',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        }),
      apiBaseUrl: localStorage.getItem('api_base_url') || 'http://localhost:3000/api/v1',
      setApiBaseUrl: (url: string) => {
        localStorage.setItem('api_base_url', url);
        set({ apiBaseUrl: url });
      },
      jwtSecret: localStorage.getItem('jwt_secret') || 'changeme-in-settings',
      setJwtSecret: (secret: string) => {
        localStorage.setItem('jwt_secret', secret);
        set({ jwtSecret: secret });
      },
    }),
    {
      name: 'ui-store',
    }
  )
);
