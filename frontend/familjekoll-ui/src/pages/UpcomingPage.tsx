import {
  Alert, CircularProgress,
} from '@mui/material'
import { Box, Stack, Typography } from '../ui'
import { useFamily } from '../family'
import { useUpcoming } from '../hooks'
import { DayGroups, FilterBar } from '../lists'

export function UpcomingPage() {
  const { applyFilters } = useFamily()
  const q = useUpcoming()
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Kommande</Typography>
      <FilterBar />
      {q.isLoading && <Box textAlign="center"><CircularProgress /></Box>}
      {q.error && <Alert severity="error">Kunde inte hämta aktiviteter.</Alert>}
      {q.data && <DayGroups list={applyFilters(q.data)} emptyText="Inget planerat framöver" />}
    </Stack>
  )
}
