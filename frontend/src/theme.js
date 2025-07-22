import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const baseThemeConfig = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  spacing: 8,
  zIndex: {
    base: 1,
    content: 10,
    sidebar: 1100,
    appBar: 1200,
    dropdownBackdrop: 1299,
    dropdown: 1300,
    modal: 1400,
    tooltip: 1500,
    snackbar: 1600,
  },
};

const createAppTheme = (mode) => createTheme({
  ...baseThemeConfig,
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          primary: {
            main: '#3D52A0',
            light: '#7091E6',
            dark: '#2A3B82',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#7091E6',
            light: '#9DB3F0',
            dark: '#4B70F5',
            contrastText: '#ffffff',
          },
          background: {
            default: '#F8F9FA',
            paper: '#FFFFFF',
            elevated: '#FFFFFF',
            dropdown: '#FFFFFF',
          },
          text: {
            primary: '#1A1A1A',
            secondary: '#666666',
            disabled: '#9E9E9E',
            hint: '#757575',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
          error: {
            main: '#D32F2F',
            light: '#EF5350',
            dark: '#C62828',
          },
          warning: {
            main: '#ED6C02',
            light: '#FF9800',
            dark: '#E65100',
          },
          info: {
            main: '#0288D1',
            light: '#03A9F4',
            dark: '#01579B',
          },
          success: {
            main: '#2E7D32',
            light: '#4CAF50',
            dark: '#1B5E20',
          },
          grey: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
        }
      : {
          primary: {
            main: '#2a8df2',
            light: '#4b70f5',
            dark: '#1b5aa1',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#3dc2ec',
            light: '#64d1f4',
            dark: '#2a87a4',
            contrastText: '#ffffff',
          },
          background: {
            default: '#121212',
            paper: '#1E1E1E',
            elevated: '#2D2D2D',
            dropdown: '#2D2D2D',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#B3B3B3',
            disabled: '#666666',
            hint: '#999999',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
          error: {
            main: '#F44336',
            light: '#E57373',
            dark: '#D32F2F',
          },
          warning: {
            main: '#FFA726',
            light: '#FFB74D',
            dark: '#F57C00',
          },
          info: {
            main: '#29B6F6',
            light: '#4FC3F7',
            dark: '#0288D1',
          },
          success: {
            main: '#66BB6A',
            light: '#81C784',
            dark: '#388E3C',
          },
          grey: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
        }),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 2px 4px rgba(0,0,0,0.05)' 
            : '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: mode === 'light' ? '#1A1A1A' : '#FFFFFF',
          color: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
          fontSize: '0.75rem',
          borderRadius: 4,
        },
      },
    },
  },
});

const publicTheme = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: 'light',
    primary: {
      main: '#3D52A0',
      light: '#7091E6',
      dark: '#2A3B82',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7091E6',
      light: '#9DB3F0',
      dark: '#4B70F5',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8F9FA',
      elevated: '#FFFFFF',
      dropdown: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      disabled: '#9E9E9E',
      hint: '#757575',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#ED6C02',
      light: '#FF9800',
      dark: '#E65100',
    },
    info: {
      main: '#0288D1',
      light: '#03A9F4',
      dark: '#01579B',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );

  const muiTheme = createAppTheme(theme);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, muiTheme, publicTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;