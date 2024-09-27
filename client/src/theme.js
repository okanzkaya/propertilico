import { createTheme } from '@mui/material/styles';

const baseTheme = {
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 16,
    h1: { fontSize: '2.5rem' },
    h2: { fontSize: '2rem' },
    h3: { fontSize: '1.75rem' },
    h4: { fontSize: '1.5rem' },
    h5: { fontSize: '1.25rem' },
    h6: { fontSize: '1rem' },
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.875rem' },
    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
      fontWeight: 500,
    },
  },
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

export const lightTheme = createTheme({
  ...baseTheme,
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
});

export const darkTheme = createTheme({
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
});

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