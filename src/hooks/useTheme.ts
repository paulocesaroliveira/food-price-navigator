
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'coral' | 'mint' | 'amber' | 'dark';

const themeStyles = {
  light: {
    '--primary': '14 71% 61%',        // #E76F51 coral
    '--secondary': '173 58% 37%',     // #2A9D8F teal
    '--background': '210 40% 98%',    // very light gray
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '210 40% 96%',         // light gray
    '--accent': '210 40% 94%',        // very light gray
    '--border': '214.3 31.8% 91.4%',  // light border
    '--ring': '14 71% 61%',           // coral
    '--destructive': '0 84% 60%',     // red
    '--destructive-foreground': '210 40% 98%',
    '--primary-foreground': '0 0% 100%',
    '--secondary-foreground': '0 0% 100%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--card-foreground': '222.2 84% 4.9%',
    '--input': '214.3 31.8% 91.4%'
  },
  coral: {
    '--primary': '14 91% 67%',        // #FF6B6B bright coral
    '--secondary': '174 67% 56%',     // #4ECDC4 teal
    '--background': '35 60% 95%',     // warm light background
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '35 40% 92%',          // warm light gray
    '--accent': '35 40% 90%',         // warm accent
    '--border': '35 31.8% 85%',       // warm border
    '--ring': '14 91% 67%',           // bright coral
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '210 40% 98%',
    '--primary-foreground': '0 0% 100%',
    '--secondary-foreground': '0 0% 100%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--card-foreground': '222.2 84% 4.9%',
    '--input': '35 31.8% 85%'
  },
  mint: {
    '--primary': '173 58% 39%',       // #26A69A mint
    '--secondary': '134 70% 75%',     // #81C784 light green
    '--background': '180 60% 96%',    // mint light background
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '180 40% 93%',         // mint light gray
    '--accent': '180 40% 91%',        // mint accent
    '--border': '180 31.8% 85%',      // mint border
    '--ring': '173 58% 39%',          // mint
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '210 40% 98%',
    '--primary-foreground': '0 0% 100%',
    '--secondary-foreground': '0 0% 100%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--card-foreground': '222.2 84% 4.9%',
    '--input': '180 31.8% 85%'
  },
  amber: {
    '--primary': '43 96% 56%',        // #FFC107 amber
    '--secondary': '37 90% 64%',      // #FF9800 orange
    '--background': '48 60% 94%',     // amber light background
    '--foreground': '222.2 84% 4.9%', // dark gray
    '--card': '0 0% 100%',            // white
    '--muted': '48 40% 90%',          // amber light gray
    '--accent': '48 40% 88%',         // amber accent
    '--border': '48 31.8% 82%',       // amber border
    '--ring': '43 96% 56%',           // amber
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '210 40% 98%',
    '--primary-foreground': '222.2 84% 4.9%',
    '--secondary-foreground': '0 0% 100%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--card-foreground': '222.2 84% 4.9%',
    '--input': '48 31.8% 82%'
  },
  dark: {
    '--primary': '14 71% 61%',        // #E76F51 coral
    '--secondary': '173 58% 47%',     // #3CBFB0 teal light
    '--background': '222.2 84% 4.9%', // dark background
    '--foreground': '210 40% 98%',    // light text
    '--card': '222.2 84% 8%',         // slightly lighter dark
    '--muted': '215 27.9% 16.9%',     // dark muted
    '--accent': '215 27.9% 19%',      // dark accent
    '--border': '215 27.9% 16.9%',    // dark border
    '--ring': '14 71% 61%',           // coral ring
    '--destructive': '0 62.8% 60.5%',
    '--destructive-foreground': '210 40% 98%',
    '--primary-foreground': '210 40% 98%',
    '--secondary-foreground': '210 40% 98%',
    '--muted-foreground': '215.4 16.3% 56%',
    '--accent-foreground': '210 40% 98%',
    '--popover': '222.2 84% 8%',
    '--popover-foreground': '210 40% 98%',
    '--card-foreground': '210 40% 98%',
    '--input': '215 27.9% 16.9%'
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

    // Apply theme-specific body class for background
    root.classList.remove('theme-light', 'theme-coral', 'theme-mint', 'theme-amber', 'theme-dark');
    root.classList.add(`theme-${newTheme}`);

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
