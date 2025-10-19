'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeName = 'dark' | 'blue' | 'red' | 'green' | 'sepia' | 'light';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('light');

  useEffect(() => {
    const saved = localStorage.getItem('vqd_theme') as ThemeName | null;
    if (saved) {
      setThemeState(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vqd_theme', theme);
    // remove any previous theme classes
    document.documentElement.classList.remove('theme-dark','theme-blue','theme-red','theme-green','theme-sepia','theme-light');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
