import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ThemeProvider } from './theme';
import { UserProvider } from './context/UserContext';

const container = document.getElementById('root');
const root = createRoot(container);

const Main = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);