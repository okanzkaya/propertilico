// src/index.js
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { lightTheme, darkTheme } from './theme';
import { UserProvider } from './context/UserContext';

const container = document.getElementById('root');
const root = createRoot(container);

const Main = () => {
  const [themeMode, setThemeMode] = useState(() => 
    localStorage.getItem('theme') || 'dark'
  );

  const theme = useMemo(() => 
    themeMode === 'light' ? lightTheme : darkTheme, 
    [themeMode]
  );

  const toggleTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
  };

  return (
    <HelmetProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <App toggleTheme={toggleTheme} />
        </UserProvider>
      </MuiThemeProvider>
    </HelmetProvider>
  );
};

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);