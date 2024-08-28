import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { lightTheme, darkTheme } from './pages/app/theme';
import CssBaseline from '@mui/material/CssBaseline';

const container = document.getElementById('root');
const root = createRoot(container);

const Main = () => {
  const [themeMode, setThemeMode] = useState('dark'); // Default to dark mode

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setThemeMode(savedTheme);
    }
  }, []);

  const theme = useMemo(() => {
    return themeMode === 'light' ? lightTheme : darkTheme;
  }, [themeMode]);

  const toggleTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App toggleTheme={toggleTheme} />
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);