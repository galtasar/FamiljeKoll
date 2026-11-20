import { useState } from 'react'
import {
  Alert, Button, CircularProgress, IconButton,
} from '@mui/material'
import { Box, Stack, Typography } from '../ui'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
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
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <IconButton aria-label="Förra veckan" onClick={() => setStart(start.subtract(1, 'week'))}><ChevronLeftRoundedIcon /></IconButton>
        <Box textAlign="center">
          <Typography variant="h5">Vecka {start.isoWeek()} 📅</Typography>
          <Typography variant="body2" color="text.secondary">{start.format('D MMM')} – {end.format('D MMM')}</Typography>
        </Box>
        <IconButton aria-label="Nästa vecka" onClick={() => setStart(start.add(1, 'week'))}><ChevronRightRoundedIcon /></IconButton>
      </Stack>
      <Box textAlign="center">
        <Button size="small" onClick={() => setStart(startOfWeek(dayjs()))}>Den här veckan</Button>
      </Box>
      <FilterBar />
      {q.isLoading && <Box textAlign="center"><CircularProgress /></Box>}
      {q.error && <Alert severity="error">Kunde inte hämta aktiviteter.</Alert>}
      <Box display="grid" gap={2} gridTemplateColumns="repeat(auto-fill, minmax(min(100%, 280px), 1fr))">
        {days.map((d) => {
          const iso = d.format(ISO)
          const items = list.filter((a) => a.date === iso).sort((a, b) => a.title.localeCompare(b.title, 'sv'))
          const isToday = iso === t
          return (
            <Box
              key={iso}
              sx={{ bgcolor: isToday ? '#FFE9E4' : '#FFFFFFAA', borderRadius: '20px', p: 1.5, border: isToday ? '2px solid #FF7A6B' : '2px solid transparent' }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={800} textTransform="capitalize">{d.format('dddd D')}</Typography>
                <Button size="small" onClick={() => openActivity({ date: iso })} aria-label={`Ny aktivitet ${iso}`}>+ Ny</Button>
              </Stack>
              <Stack spacing={1}>
                {items.length === 0 ? <Typography variant="body2" color="text.secondary">–</Typography>
                  : items.map((a) => <ActivityCard key={a.id} activity={a} />)}
              </Stack>
            </Box>
          )
        })}
      </Box>
    </Stack>
  )
}
