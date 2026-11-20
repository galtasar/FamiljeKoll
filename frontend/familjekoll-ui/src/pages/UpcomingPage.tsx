import {
  Alert, CircularProgress,
} from '@mui/material'
import { Box, Stack, Typography } from '../ui'
import { useUpcoming } from '../hooks'
import { DayGroups } from '../lists'

export function UpcomingPage() {
  const q = useUpcoming()
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Kommande</Typography>
      {q.isLoading && <Box textAlign="center"><CircularProgress /></Box>}
      {q.error && <Alert severity="error">Kunde inte hämta aktiviteter.</Alert>}
      {q.data && <DayGroups list={q.data} emptyText="Inget planerat framöver" />}
    </Stack>
  )
}
