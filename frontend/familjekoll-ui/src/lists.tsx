import {
  Chip,
} from '@mui/material'
import { Box, Stack, Typography } from './ui'
import { useFamily } from './family'
import { ActivityCard } from './ActivityCard'
import { Empty } from './bits'
import { friendlyDate } from './dates'
import type { ActivityDto } from './types'

export function FilterBar() {
  const { activeMembers, categories, filters, setFilters } = useFamily()
  return (
    <Stack direction="row" gap={1} flexWrap="wrap" mb={2} alignItems="center">
      <Chip
        label="Alla"
        color={!filters.memberId ? 'primary' : 'default'}
        variant={!filters.memberId ? 'filled' : 'outlined'}
        onClick={() => setFilters({ ...filters, memberId: null })}
      />
      {activeMembers.map((m) => {
        const on = filters.memberId === m.id
        return (
          <Chip
            key={m.id}
            label={`${m.emoji} ${m.name}`}
            onClick={() => setFilters({ ...filters, memberId: on ? null : m.id })}
            sx={{ bgcolor: on ? m.color : 'transparent', border: `2px solid ${m.color}`, color: 'text.primary' }}
          />
        )
      })}
      {categories.map((c) => {
        const on = filters.categoryId === c.id
        return (
          <Chip
            key={c.id}
            size="small"
            label={`${c.emoji} ${c.name}`}
            onClick={() => setFilters({ ...filters, categoryId: on ? null : c.id })}
            sx={{ bgcolor: on ? c.color : 'transparent', border: `1px solid ${c.color}`, color: 'text.primary' }}
          />
        )
      })}
    </Stack>
  )
}

export function groupByDate(list: ActivityDto[]) {
  const map = new Map<string, ActivityDto[]>()
  for (const a of [...list].sort((x, y) => x.date.localeCompare(y.date) || x.title.localeCompare(y.title, 'sv'))) {
    map.set(a.date, [...(map.get(a.date) ?? []), a])
  }
  return [...map.entries()]
}

export function DayGroups({ list, emptyText }: { list: ActivityDto[]; emptyText: string }) {
  if (list.length === 0) return <Empty emoji="🌈" text={emptyText} />
  return (
    <Stack spacing={3}>
      {groupByDate(list).map(([date, items]) => (
        <Box key={date}>
          <Typography variant="h6" color="secondary.main" mb={1}>{friendlyDate(date)}</Typography>
          <Stack spacing={1.5}>
            {items.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
