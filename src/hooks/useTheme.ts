
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'coral' | 'mint' | 'amber' | 'dark';

const themeStyles = {
  light: {
    '--primary': '221 83% 53%',     // Blue
    '--secondary': '173 58% 37%',   // Teal
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '210 40% 98%',
    '--accent': '221 83% 53%',
    '--border': '214.3 31.8% 91.4%',
    '--ring': '221 83% 53%'
  },
  coral: {
    '--primary': '14 91% 67%',      // Coral
    '--secondary': '174 67% 56%',   // Teal
    '--background': '35 100% 97%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '35 40% 95%',
    '--accent': '14 91% 67%',
    '--border': '214.3 31.8% 91.4%',
    '--ring': '14 91% 67%'
  },
  mint: {
    '--primary': '173 58% 39%',     // Mint
    '--secondary': '134 70% 75%',   // Light green
    '--background': '180 100% 98%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '180 40% 95%',
    '--accent': '173 58% 39%',
    '--border': '214.3 31.8% 91.4%',
    '--ring': '173 58% 39%'
  },
  amber: {
    '--primary': '43 96% 56%',      // Amber
    '--secondary': '37 90% 64%',    // Orange
    '--background': '56 100% 95%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--muted': '56 40% 92%',
    '--accent': '43 96% 56%',
    '--border': '214.3 31.8% 91.4%',
    '--ring': '43 96% 56%'
  },
  dark: {
    '--primary': '221 83% 53%',
    '--secondary': '173 58% 37%',
    '--background': '222.2 84% 4.9%',
    '--foreground': '210 40% 98%',
    '--card': '222.2 84% 4.9%',
    '--muted': '215 27.9% 16.9%',
    '--accent': '215 27.9% 16.9%',
    '--border': '215 27.9% 16.9%',
    '--ring': '221 83% 53%'
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
