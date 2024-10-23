import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { lightTheme, darkTheme } from './theme';
import { UserProvider } from './context/UserContext';

const container = document.getElementById('root');
const root = createRoot(container);

const Main = () => {
  const [themeMode, setThemeMode] = useState(() => 
    localStorage.getItem('theme') || 'dark' // Default to dark mode
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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <UserProvider>
            <App toggleTheme={toggleTheme} />
          </UserProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </HelmetProvider>
  );
};

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();