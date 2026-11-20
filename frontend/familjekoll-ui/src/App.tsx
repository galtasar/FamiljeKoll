import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert, BottomNavigation, BottomNavigationAction, Button, CircularProgress, Container, Fab, Paper, Tab, Tabs, useMediaQuery, useTheme,
} from '@mui/material'
import { Box, Stack, Typography } from './ui'
import TodayRoundedIcon from '@mui/icons-material/TodayRounded'
import CalendarViewWeekRoundedIcon from '@mui/icons-material/CalendarViewWeekRounded'
import UpcomingRoundedIcon from '@mui/icons-material/UpcomingRounded'
import FamilyRestroomRoundedIcon from '@mui/icons-material/FamilyRestroomRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { api, ApiError } from './api'
import { FamilyProvider } from './family'
import { ActivityDialog, type DialogTarget } from './ActivityDialog'
import { TodayPage } from './pages/TodayPage'
import { WeekPage } from './pages/WeekPage'
import { UpcomingPage } from './pages/UpcomingPage'
import { FamilyPage } from './pages/FamilyPage'

const NAV = [
  { path: '/', label: 'Idag', icon: <TodayRoundedIcon /> },
  { path: '/vecka', label: 'Vecka', icon: <CalendarViewWeekRoundedIcon /> },
  { path: '/kommande', label: 'Kommande', icon: <UpcomingRoundedIcon /> },
  { path: '/familjen', label: 'Familjen', icon: <FamilyRestroomRoundedIcon /> },
]

function Center({ children }: { children: React.ReactNode }) {
  return (
    <Box minHeight="100dvh" display="flex" alignItems="center" justifyContent="center" p={3}>
      <Stack spacing={3} alignItems="center" textAlign="center" maxWidth={420}>{children}</Stack>
    </Box>
  )
}

function Login({ providers }: { providers: string[] }) {
  return (
    <Center>
      <Typography fontSize={72}>🏡</Typography>
      <Typography variant="h4">FamiljeKoll</Typography>
      <Typography color="text.secondary">Logga in för att se familjens aktiviteter.</Typography>
      {providers.length === 0 && <Alert severity="warning">Ingen inloggning är konfigurerad.</Alert>}
      {providers.map((p) => (
        <Button key={p} variant="contained" size="large" fullWidth href={`/auth/login/${p}?returnUrl=/`}>
          Logga in med {p}
        </Button>
      ))}
    </Center>
  )
}

function NoAccess({ email }: { email: string }) {
  const logout = async () => {
    await fetch('/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }
  return (
    <Center>
      <Typography fontSize={64}>🔒</Typography>
      <Typography variant="h5">Ingen åtkomst</Typography>
      <Typography color="text.secondary">{email} har inte tillgång till den här familjen. Be någon i familjen lägga till din e-postadress.</Typography>
      <Button variant="outlined" onClick={logout}>Logga ut</Button>
    </Center>
  )
}

function Shell() {
  const theme = useTheme()
  const wide = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()
  const navigate = useNavigate()
  const [target, setTarget] = useState<DialogTarget | null>(null)
  const openActivity = useCallback((t: DialogTarget | null) => setTarget(t), [])
  const current = NAV.find((n) => n.path === location.pathname)?.path ?? '/'

  return (
    <FamilyProvider openActivity={openActivity}>
      <Box minHeight="100dvh" pb={{ xs: 14, md: 6 }}>
        <Paper square elevation={0} sx={{ bgcolor: '#E5503F', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" justifyContent="space-between" minHeight={60}>
              <Typography variant="h6" fontWeight={800}>🏡 FamiljeKoll</Typography>
              {wide && (
                <Tabs
                  value={current}
                  onChange={(_, v) => navigate(v)}
                  textColor="inherit"
                  slotProps={{ indicator: { style: { backgroundColor: '#fff', height: 4 } } }}
                >
                  {NAV.map((n) => <Tab key={n.path} value={n.path} label={n.label} icon={n.icon} iconPosition="start" />)}
                </Tabs>
              )}
              <Box width={wide ? 120 : 0} />
            </Stack>
          </Container>
        </Paper>

        <Container maxWidth="lg" sx={{ pt: 3 }}>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/vecka" element={<WeekPage />} />
            <Route path="/kommande" element={<UpcomingPage />} />
            <Route path="/familjen" element={<FamilyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>

        <Fab
          color="primary"
          variant="extended"
          aria-label="Ny aktivitet"
          onClick={() => setTarget({})}
          sx={{ position: 'fixed', right: 20, bottom: { xs: 88, md: 28 }, zIndex: 20, fontSize: 16 }}
        >
          <AddRoundedIcon sx={{ mr: 1 }} /> Ny aktivitet
        </Fab>

        {!wide && (
          <Paper elevation={8} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 15, pb: 'env(safe-area-inset-bottom)' }}>
            <BottomNavigation showLabels value={current} onChange={(_, v) => navigate(v)} sx={{ height: 68 }}>
              {NAV.map((n) => <BottomNavigationAction key={n.path} value={n.path} label={n.label} icon={n.icon} />)}
            </BottomNavigation>
          </Paper>
        )}

        <ActivityDialog target={target} onClose={() => setTarget(null)} />
      </Box>
    </FamilyProvider>
  )
}

function Gate() {
  const qc = useQueryClient()
  const config = useQuery({ queryKey: ['public-config'], queryFn: api.publicConfig, staleTime: Infinity })
  const me = useQuery({ queryKey: ['me'], queryFn: api.me, retry: false, staleTime: 5 * 60_000 })

  if (config.isLoading || me.isLoading) return <Center><CircularProgress /></Center>
  if (me.error instanceof ApiError && me.error.status === 401) return <Login providers={config.data?.providers ?? []} />
  if (me.error || !me.data) {
    return (
      <Center>
        <Alert severity="error">Kunde inte kontakta servern.</Alert>
        <Button onClick={() => qc.invalidateQueries({ queryKey: ['me'] })}>Försök igen</Button>
      </Center>
    )
  }
  if (!me.data.allowed) return <NoAccess email={me.data.email} />
  return <Shell />
}

export default function App() {
  return (
    <BrowserRouter>
      <Gate />
    </BrowserRouter>
  )
}
