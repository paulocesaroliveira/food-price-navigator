
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'coral' | 'mint' | 'amber' | 'dark';

const themeStyles = {
  light: {
    '--primary': '14 71% 61%',        // #E76F51 coral
    '--secondary': '173 58% 37%',     // #2A9D8F teal
    '--background': '0 0% 100%',      // white
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '210 40% 98%',         // light gray
    '--accent': '14 71% 61%',         // coral
    '--border': '214.3 31.8% 91.4%',  // light border
    '--ring': '14 71% 61%'            // coral
  },
  coral: {
    '--primary': '14 91% 67%',        // #FF6B6B bright coral
    '--secondary': '174 67% 56%',     // #4ECDC4 teal
    '--background': '35 100% 97%',    // warm white
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '35 40% 95%',          // warm light gray
    '--accent': '14 91% 67%',         // bright coral
    '--border': '35 31.8% 88%',       // warm border
    '--ring': '14 91% 67%'            // bright coral
  },
  mint: {
    '--primary': '173 58% 39%',       // #26A69A mint
    '--secondary': '134 70% 75%',     // #81C784 light green
    '--background': '180 100% 98%',   // mint white
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '180 40% 95%',         // mint light gray
    '--accent': '173 58% 39%',        // mint
    '--border': '180 31.8% 88%',      // mint border
    '--ring': '173 58% 39%'           // mint
  },
  amber: {
    '--primary': '43 96% 56%',        // #FFC107 amber
    '--secondary': '37 90% 64%',      // #FF9800 orange
    '--background': '56 100% 95%',    // amber white
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '56 40% 92%',          // amber light gray
    '--accent': '43 96% 56%',         // amber
    '--border': '56 31.8% 85%',       // amber border
    '--ring': '43 96% 56%'            // amber
  },
  dark: {
    '--primary': '14 71% 61%',        // #E76F51 coral
    '--secondary': '173 58% 37%',     // #2A9D8F teal
    '--background': '222.2 84% 4.9%', // dark background
    '--foreground': '210 40% 98%',    // light text
    '--card': '222.2 84% 7%',         // slightly lighter dark
    '--muted': '215 27.9% 16.9%',     // dark muted
    '--accent': '215 27.9% 16.9%',    // dark accent
    '--border': '215 27.9% 16.9%',    // dark border
    '--ring': '14 71% 61%'            // coral ring
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

    // Force a repaint to ensure styles are applied
    root.style.display = 'none';
    root.offsetHeight; // trigger reflow
    root.style.display = '';
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    applyTheme(newTheme);
  };

  return { theme, changeTheme };
};
