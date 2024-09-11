import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
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
  typography: {
    fontFamily: 'Roboto, sans-serif',
    button: {
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
          backgroundColor: '#3D52A0',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#7091E6',
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#EDE8F5',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#EDE8F5',
          borderRadius: '8px',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            backgroundColor: '#7091E6',
            color: '#FFFFFF',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#8697C4',
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#444444',
          color: '#FFFFFF',
          borderRadius: '4px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#222222',
          '&:hover': {
            color: '#111111',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
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
  typography: {
    fontFamily: 'Roboto, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          padding: '6px 16px',
          backgroundColor: '#4B70F5',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#402E7A',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2A283E',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2A283E',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
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
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#3A3A3A',
          color: '#FFFFFF',
        },
      },
    },
  },
});

export const sidebarTheme = createTheme({
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
