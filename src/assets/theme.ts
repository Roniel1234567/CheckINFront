import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgba(19, 51, 86, 1)',
      light: 'rgba(2, 80, 142, 1)',
      dark: 'rgba(81, 129, 177, 1)',
      contrastText: 'rgba(168, 207, 239, 1)',
    },
    secondary: {
      main: 'rgba(212, 186, 69, 1)',
      light: 'rgba(244, 229, 171, 1)',
    },
    background: {
      default: 'rgb(226, 236, 244)',
      paper: 'rgb(252, 252, 255)',
    },
  },
  typography: {
    fontFamily: '"Century Gothic", "sans-serif"',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
export default theme; 