import { createTheme } from '@mui/material/styles'

export const INK = '#25221F'
export const MUTED = '#8A847B'
export const LINE = '#ECEAE5'
export const TINT = '#ECEBE7'

const serif = 'Georgia, "Times New Roman", serif'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: INK, contrastText: '#fff' },
    secondary: { main: '#2F7D6B', contrastText: '#fff' },
    error: { main: '#C0462F' },
    success: { main: '#2F7D6B' },
    background: { default: '#FAF9F7', paper: '#FFFFFF' },
    text: { primary: INK, secondary: '#6B665F' },
    divider: LINE,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    h4: { fontFamily: serif, fontWeight: 700, fontSize: '1.9rem' },
    h5: { fontFamily: serif, fontWeight: 700 },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40, borderRadius: 10, paddingInline: 18 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 40, minHeight: 40 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, minHeight: 32, borderRadius: 8 } } },
    MuiCard: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { borderColor: LINE, borderRadius: 12 } } },
    MuiDialog: { defaultProps: { fullWidth: true, maxWidth: 'sm' }, styleOverrides: { paper: { borderRadius: 14 } } },
    MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
  },
})
