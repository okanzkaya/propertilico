import { createTheme } from '@mui/material/styles';

// Typography configuration based on font size
const getTypographyConfig = (fontSize) => ({
  fontFamily: 'Roboto, sans-serif',
  fontSize: fontSize === 'small' ? 14 : fontSize === 'large' ? 18 : 16,
  h1: {
    fontSize: fontSize === 'small' ? '2.25rem' : fontSize === 'large' ? '2.75rem' : '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2
  },
  h2: {
    fontSize: fontSize === 'small' ? '1.75rem' : fontSize === 'large' ? '2.25rem' : '2rem',
    fontWeight: 600,
    lineHeight: 1.3
  },
  h3: {
    fontSize: fontSize === 'small' ? '1.5rem' : fontSize === 'large' ? '2rem' : '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4
  },
  h4: {
    fontSize: fontSize === 'small' ? '1.25rem' : fontSize === 'large' ? '1.75rem' : '1.5rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  h5: {
    fontSize: fontSize === 'small' ? '1rem' : fontSize === 'large' ? '1.5rem' : '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  h6: {
    fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.25rem' : '1rem',
    fontWeight: 500,
    lineHeight: 1.4
  },
  body1: {
    fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.125rem' : '1rem',
    lineHeight: 1.5
  },
  body2: {
    fontSize: fontSize === 'small' ? '0.75rem' : fontSize === 'large' ? '1rem' : '0.875rem',
    lineHeight: 1.5
  },
  button: {
    fontSize: fontSize === 'small' ? '0.75rem' : fontSize === 'large' ? '1rem' : '0.875rem',
    textTransform: 'none',
    fontWeight: 500,
    lineHeight: 1.5
  },
  subtitle1: {
    fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.125rem' : '1rem',
    lineHeight: 1.5
  },
  subtitle2: {
    fontSize: fontSize === 'small' ? '0.75rem' : fontSize === 'large' ? '1rem' : '0.875rem',
    lineHeight: 1.5
  },
  caption: {
    fontSize: fontSize === 'small' ? '0.625rem' : fontSize === 'large' ? '0.875rem' : '0.75rem',
    lineHeight: 1.5
  },
  overline: {
    fontSize: fontSize === 'small' ? '0.625rem' : fontSize === 'large' ? '0.875rem' : '0.75rem',
    textTransform: 'uppercase',
    lineHeight: 1.5
  }
});

// Base theme components configuration
const baseTheme = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
  },
};

// Create theme based on mode and fontSize
export const createAppTheme = (mode = 'light', fontSize = 'medium') => {
  const themeOptions = mode === 'light' ? {
    palette: {
      mode: 'light',
      primary: {
        main: '#3D52A0',
        light: '#7091E6',
        dark: '#2A3B82',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#7091E6',
        light: '#9DB3F0',
        dark: '#4B70F5',
        contrastText: '#FFFFFF',
      },
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
      background: {
        default: '#FFFFFF',
        paper: '#EDE8F5',
      },
      text: {
        primary: '#222222',
        secondary: '#333333',
      },
      divider: '#ADBBDA',
      action: {
        active: '#6B7280',
        hover: 'rgba(107, 114, 128, 0.08)',
        selected: 'rgba(107, 114, 128, 0.16)',
        disabled: 'rgba(107, 114, 128, 0.38)',
        disabledBackground: 'rgba(107, 114, 128, 0.12)',
      },
    },
    components: {
      ...baseTheme.components,
      MuiButton: {
        styleOverrides: {
          root: {
            ...baseTheme.components.MuiButton.styleOverrides.root,
            backgroundColor: '#3D52A0',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#7091E6',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorDefault: {
            backgroundColor: '#3D52A0',
            color: '#FFFFFF',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            ...baseTheme.components.MuiListItem.styleOverrides.root,
            '&.Mui-selected': {
              backgroundColor: '#7091E6',
              color: '#FFFFFF',
            },
            '&.Mui-selected:hover': {
              backgroundColor: '#8697C4',
            },
          },
        },
      },
    },
  } : {
    palette: {
      mode: 'dark',
      primary: {
        main: '#2a8df2',
        light: '#4B70F5',
        dark: '#1B5AA1',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#3DC2EC',
        light: '#64D1F4',
        dark: '#2A87A4',
        contrastText: '#FFFFFF',
      },
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
      background: {
        default: '#1C1B29',
        paper: '#2A283E',
      },
      text: {
        primary: '#E1E1E6',
        secondary: '#A9A9B3',
      },
      divider: '#3D3D4D',
      action: {
        active: '#A9A9B3',
        hover: 'rgba(169, 169, 179, 0.08)',
        selected: 'rgba(169, 169, 179, 0.16)',
        disabled: 'rgba(169, 169, 179, 0.38)',
        disabledBackground: 'rgba(169, 169, 179, 0.12)',
      },
    },
    components: {
      ...baseTheme.components,
      MuiButton: {
        styleOverrides: {
          root: {
            ...baseTheme.components.MuiButton.styleOverrides.root,
            backgroundColor: '#4B70F5',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#402E7A',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorDefault: {
            backgroundColor: '#1C1B29',
            color: '#FFFFFF',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            ...baseTheme.components.MuiListItem.styleOverrides.root,
            '&.Mui-selected': {
              backgroundColor: '#3D3D4D',
              color: '#FFFFFF',
            },
            '&.Mui-selected:hover': {
              backgroundColor: '#2F2F3A',
            },
          },
        },
      },
    },
  };

  return createTheme({
    ...baseTheme,
    ...themeOptions,
    typography: getTypographyConfig(fontSize),
  });
};

// Export default themes
export const lightTheme = createAppTheme('light', 'medium');
export const darkTheme = createAppTheme('dark', 'medium');
export const sidebarTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#2a8df2',
    },
    secondary: {
      main: '#3DC2EC',
    },
    background: {
      default: '#2A283E',
      paper: '#2A283E',
    },
    text: {
      primary: '#E1E1E6',
      secondary: '#A9A9B3',
    },
    divider: '#3D3D4D',
  },
});