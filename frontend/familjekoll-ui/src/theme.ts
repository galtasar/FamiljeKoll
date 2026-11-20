import { createTheme } from '@mui/material/styles'

export const CORAL = '#FF7A6B'
export const TURQUOISE = '#2BB5B0'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#E5503F', light: CORAL, contrastText: '#fff' },
    secondary: { main: '#0E8F8A', light: TURQUOISE, contrastText: '#fff' },
    background: { default: '#FFF8F1', paper: '#FFFFFF' },
    text: { primary: '#2D2A32', secondary: '#5F5A66' },
    success: { main: '#2E9E5B' },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: '"Nunito", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, borderRadius: 999, paddingInline: 20 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 700, minHeight: 36, borderRadius: 999 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 2px 10px rgba(80,50,40,.08)' } } },
    MuiDialog: { defaultProps: { fullWidth: true, maxWidth: 'sm' } },
  },
})
