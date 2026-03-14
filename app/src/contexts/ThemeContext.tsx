import { createContext, useContext } from 'react';

export type ThemeMode = 'light';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light';
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  document.documentElement.classList.remove('dark');
  return (
    <ThemeContext.Provider value={{ theme: 'light', setTheme: () => {}, resolvedTheme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
