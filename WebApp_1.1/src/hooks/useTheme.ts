import { useContext, useEffect } from 'react';
import { ThemeContext, Theme } from '../lib/theme';

export function useTheme() {
  const context = useContext(ThemeContext);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(context.theme);
  }, [context.theme]);

  return context;
}