import {
  Alert, CircularProgress,
} from '@mui/material'
import { Box, Stack, Typography } from '../ui'
import dayjs from 'dayjs'
import { useFamily } from '../family'
import { useRange } from '../hooks'
import { ActivityCard } from '../ActivityCard'
import { FilterBar } from '../lists'
import { ISO, today } from '../dates'

export function TodayPage() {
  const { applyFilters } = useFamily()
  const t = today()
  // Include the last two weeks so that missed things are still visible.
  const q = useRange(dayjs().subtract(14, 'day').format(ISO), t)

  if (q.isLoading) return <Box textAlign="center" py={6}><CircularProgress /></Box>
  if (q.error) return <Alert severity="error">Kunde inte hämta aktiviteter.</Alert>

  const all = applyFilters(q.data ?? [])
  const todays = all.filter((a) => a.date === t)
  const overdue = all.filter((a) => a.date < t && !a.isDone)
  const done = todays.filter((a) => a.isDone).length
  const allDone = todays.length > 0 && done === todays.length && overdue.length === 0

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Idag ☀️</Typography>
        <Typography color="text.secondary" textTransform="capitalize">{dayjs().format('dddd D MMMM')}</Typography>
        {todays.length > 0 && (
          <Box mt={1.5}>
            <Box sx={{ height: 12, borderRadius: 6, bgcolor: '#E4DDD6', overflow: 'hidden' }}>
              <Box sx={{ height: 1, width: `${(done / todays.length) * 100}%`, bgcolor: 'success.main', transition: 'width .4s' }} />
            </Box>
            <Typography variant="body2" mt={0.5}>{done} av {todays.length} klara</Typography>
          </Box>
        )}
      </Box>
      <FilterBar />
      {allDone && <Alert icon={<span>🎉</span>} severity="success" sx={{ fontSize: 18 }}>Allt klart för idag! Bra jobbat!</Alert>}
      {overdue.length > 0 && (
        <Box>
          <Typography variant="h6" color="error" mb={1}>Missat sedan tidigare</Typography>
          <Stack spacing={1.5}>{overdue.map((a) => <ActivityCard key={a.id} activity={a} />)}</Stack>
        </Box>
      )}
      {todays.length === 0 && overdue.length === 0 ? (
        <Box textAlign="center" py={6} color="text.secondary">
          <Typography fontSize={56}>🌤️</Typography>
          <Typography variant="h6">Inget att göra idag</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>{todays.map((a) => <ActivityCard key={a.id} activity={a} />)}</Stack>
      )}
    </Stack>
  )
}
