
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'coral' | 'mint' | 'amber' | 'dark';

const themeStyles = {
  light: {
    '--primary': '14 71% 61%',
    '--secondary': '173 58% 37%',
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '210 40% 98%',
    '--accent': '14 71% 61%',
    '--border': '214.3 31.8% 91.4%'
  },
  coral: {
    '--primary': '4 90% 69%',
    '--secondary': '174 67% 56%',
    '--background': '35 100% 97%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '35 40% 95%',
    '--accent': '4 90% 69%',
    '--border': '214.3 31.8% 91.4%'
  },
  mint: {
    '--primary': '179 78% 48%',
    '--secondary': '134 70% 75%',
    '--background': '180 100% 98%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '180 40% 95%',
    '--accent': '179 78% 48%',
    '--border': '214.3 31.8% 91.4%'
  },
  amber: {
    '--primary': '37 90% 64%',
    '--secondary': '43 45% 64%',
    '--background': '56 100% 95%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '56 40% 92%',
    '--accent': '37 90% 64%',
    '--border': '214.3 31.8% 91.4%'
  },
  dark: {
    '--primary': '14 71% 61%',
    '--secondary': '173 58% 37%',
    '--background': '222.2 84% 4.9%',
    '--foreground': '210 40% 98%',
    '--card': '222.2 84% 4.9%',
    '--muted': '215 27.9% 16.9%',
    '--accent': '215 27.9% 16.9%',
    '--border': '215 27.9% 16.9%'
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const styles = themeStyles[newTheme];
    
    // Remove dark class for all themes
    root.classList.remove('dark');
    
    // Add dark class only for dark theme
    if (newTheme === 'dark') {
      root.classList.add('dark');
    }

    // Apply CSS custom properties
    Object.entries(styles).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    applyTheme(newTheme);
  };

  return { theme, changeTheme };
};
