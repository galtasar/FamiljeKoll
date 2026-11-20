import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, CircularProgress, Container, Fab, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Box, Stack, Typography } from './ui'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { api, ApiError } from './api'
import { TINT } from './theme'
import { FamilyProvider } from './family'
import { ActivityDialog, type DialogTarget } from './ActivityDialog'
import { TodayPage } from './pages/TodayPage'
import { WeekPage } from './pages/WeekPage'
import { UpcomingPage } from './pages/UpcomingPage'
import { FamilyPage } from './pages/FamilyPage'

const NAV = [
  { path: '/', label: 'Idag' },
  { path: '/vecka', label: 'Vecka' },
  { path: '/kommande', label: 'Kommande' },
  { path: '/familjen', label: 'Familjen' },
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
      <Typography variant="h5">Ingen åtkomst</Typography>
      <Typography color="text.secondary">{email} har inte tillgång till den här familjen. Be någon i familjen lägga till din e-postadress.</Typography>
      <Button variant="outlined" onClick={logout}>Logga ut</Button>
    </Center>
  )
}

function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [target, setTarget] = useState<DialogTarget | null>(null)
  const openActivity = useCallback((t: DialogTarget | null) => setTarget(t), [])
  const current = NAV.find((n) => n.path === location.pathname)?.path ?? '/'

  return (
    <FamilyProvider openActivity={openActivity}>
      <Box minHeight="100dvh" pb={12}>
        <Container maxWidth="lg" sx={{ pt: { xs: 1.5, md: 2.5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700 }}>FamiljeKoll</Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth={false}
              value={current}
              onChange={(_, v) => v && navigate(v)}
              aria-label="Navigering"
              sx={{
                bgcolor: TINT, p: '3px', borderRadius: '10px', gap: '2px',
                '& .MuiToggleButton-root': {
                  flex: 1, border: 0, borderRadius: '8px !important', px: { xs: 0.5, sm: 2 }, py: 0.75, minWidth: 0, color: 'text.secondary', fontSize: 14,
                  '&.Mui-selected': { bgcolor: '#fff', color: 'text.primary', boxShadow: '0 1px 2px rgba(0,0,0,.08)' },
                },
              }}
            >
              {NAV.map((n) => <ToggleButton key={n.path} value={n.path}>{n.label}</ToggleButton>)}
            </ToggleButtonGroup>
          </Stack>
        </Container>

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
          sx={{ position: 'fixed', right: 20, bottom: 20, zIndex: 20, fontSize: 15, borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,.2)' }}
        >
          <AddRoundedIcon sx={{ mr: 1 }} /> Ny aktivitet
        </Fab>

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
