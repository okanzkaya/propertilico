import { createTheme } from '@mui/material/styles';

const getTypographyConfig = (fontSize) => ({
  fontFamily: 'Roboto, sans-serif',
  fontSize: fontSize === 'small' ? 14 : fontSize === 'large' ? 18 : 16,
  h1: {
    fontSize: fontSize === 'small' ? '2.25rem' : fontSize === 'large' ? '2.75rem' : '2.5rem'
  },
  h2: {
    fontSize: fontSize === 'small' ? '1.75rem' : fontSize === 'large' ? '2.25rem' : '2rem'
  },
  h3: {
    fontSize: fontSize === 'small' ? '1.5rem' : fontSize === 'large' ? '2rem' : '1.75rem'
  },
  h4: {
    fontSize: fontSize === 'small' ? '1.25rem' : fontSize === 'large' ? '1.75rem' : '1.5rem'
  },
  h5: {
    fontSize: fontSize === 'small' ? '1rem' : fontSize === 'large' ? '1.5rem' : '1.25rem'
  },
  h6: {
    fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.25rem' : '1rem'
  },
  body1: {
    fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.125rem' : '1rem'
  },
  body2: {
    fontSize: fontSize === 'small' ? '0.75rem' : fontSize === 'large' ? '1rem' : '0.875rem'
  },
  button: {
    fontSize: fontSize === 'small' ? '0.75rem' : fontSize === 'large' ? '1rem' : '0.875rem',
    textTransform: 'none',
    fontWeight: 500,
  },
});

const baseTheme = {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '6px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: '4px',
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
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#7091E6',
        contrastText: '#FFFFFF',
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
      },
      secondary: {
        main: '#3DC2EC',
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

// Export themes for backward compatibility
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