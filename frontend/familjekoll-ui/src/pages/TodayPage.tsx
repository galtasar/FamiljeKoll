import {
  Alert, CircularProgress,
} from '@mui/material'
import { Box, Stack, Typography } from '../ui'
import dayjs from 'dayjs'
import { useFamily } from '../family'
import { useRange } from '../hooks'
import { ActivityCard } from '../ActivityCard'
import { FilterBar, SectionTitle } from '../lists'
import { Empty } from '../bits'
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
        <Typography variant="h4">Idag</Typography>
        <Typography color="text.secondary">
          <span style={{ textTransform: 'capitalize' }}>{dayjs().format('dddd D MMMM')}</span>
          {todays.length > 0 ? ` · ${done} av ${todays.length} klara` : ''}
        </Typography>
        {todays.length > 0 && (
          <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#ECEAE5', overflow: 'hidden', mt: 1.5, maxWidth: 320 }}>
            <Box sx={{ height: 1, width: `${(done / todays.length) * 100}%`, bgcolor: 'success.main', transition: 'width .4s' }} />
          </Box>
        )}
      </Box>
      <FilterBar />
      {allDone && <Alert severity="success" variant="outlined">Allt klart för idag. Bra jobbat!</Alert>}
      {overdue.length > 0 && (
        <Box>
          <SectionTitle color="#C0462F">Missat sedan tidigare</SectionTitle>
          <Stack spacing={1}>{overdue.map((a) => <ActivityCard key={a.id} activity={a} />)}</Stack>
        </Box>
      )}
      {todays.length === 0 && overdue.length === 0 ? (
        <Empty text="Inget att göra idag" />
      ) : (
        <Box>
          <SectionTitle>Idag</SectionTitle>
          <Stack spacing={1}>{todays.map((a) => <ActivityCard key={a.id} activity={a} />)}</Stack>
        </Box>
      )}
    </Stack>
  )
}
