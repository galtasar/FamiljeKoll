import { useState } from 'react'
import {
  Alert, Button, CircularProgress, IconButton,
} from '@mui/material'
import { Box, Stack, Typography } from '../ui'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import dayjs from 'dayjs'
import { useFamily } from '../family'
import { useRange } from '../hooks'
import { ActivityCard } from '../ActivityCard'
import { FilterBar } from '../lists'
import { ISO, startOfWeek, today } from '../dates'

export function WeekPage() {
  const { applyFilters, openActivity } = useFamily()
  const [start, setStart] = useState(() => startOfWeek(dayjs()))
  const end = start.add(6, 'day')
  const q = useRange(start.format(ISO), end.format(ISO))
  const list = applyFilters(q.data ?? [])
  const days = Array.from({ length: 7 }, (_, i) => start.add(i, 'day'))
  const t = today()

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4">Vecka {start.isoWeek()}</Typography>
          <Typography variant="body2" color="text.secondary">{start.format('D MMM')} – {end.format('D MMM YYYY')}</Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton aria-label="Förra veckan" onClick={() => setStart(start.subtract(1, 'week'))}><ChevronLeftRoundedIcon /></IconButton>
          <Button size="small" onClick={() => setStart(startOfWeek(dayjs()))}>Idag</Button>
          <IconButton aria-label="Nästa vecka" onClick={() => setStart(start.add(1, 'week'))}><ChevronRightRoundedIcon /></IconButton>
        </Stack>
      </Stack>
      <FilterBar />
      {q.isLoading && <Box textAlign="center"><CircularProgress /></Box>}
      {q.error && <Alert severity="error">Kunde inte hämta aktiviteter.</Alert>}
      <Box display="grid" gap={1.25} gridTemplateColumns={{ xs: '1fr', lg: 'repeat(7, minmax(0, 1fr))' }}>
        {days.map((d) => {
          const iso = d.format(ISO)
          const items = list.filter((a) => a.date === iso).sort((a, b) => a.title.localeCompare(b.title, 'sv'))
          const isToday = iso === t
          return (
            <Box
              key={iso}
              sx={{
                bgcolor: 'background.paper', borderRadius: '12px', p: 1.25, display: 'flex', flexDirection: 'column', gap: 1,
                minHeight: { lg: 260 }, border: '1px solid', borderColor: isToday ? 'primary.main' : 'divider',
                boxShadow: isToday ? '0 0 0 1px #25221F' : 'none',
              }}
            >
              <Stack direction="row" justifyContent={{ xs: 'flex-start', lg: 'space-between' }} alignItems="center" spacing={{ xs: 1.5, lg: 0 }}
                sx={{ borderBottom: '1px solid #F0EEE9', pb: 0.75 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'text.secondary', width: { xs: 36, lg: 'auto' } }}>
                  {d.format('ddd')}
                </Typography>
                <Box
                  sx={{
                    fontSize: 16, fontWeight: 600, width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    bgcolor: isToday ? 'primary.main' : 'transparent', color: isToday ? '#fff' : 'text.primary',
                  }}
                >
                  {d.date()}
                </Box>
                <Box flex={{ xs: 1, lg: 0 }} />
                <IconButton size="small" onClick={() => openActivity({ date: iso })} aria-label={`Ny aktivitet ${iso}`} sx={{ minWidth: 30, minHeight: 30 }}>
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              {items.map((a) => <ActivityCard key={a.id} activity={a} compact />)}
            </Box>
          )
        })}
      </Box>
    </Stack>
  )
}
