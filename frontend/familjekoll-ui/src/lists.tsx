import { Box, Stack, Typography } from './ui'
import { ActivityCard } from './ActivityCard'
import { Empty } from './bits'
import { friendlyDate } from './dates'
import type { ActivityDto } from './types'

export function groupByDate(list: ActivityDto[]) {
  const map = new Map<string, ActivityDto[]>()
  for (const a of [...list].sort((x, y) => x.date.localeCompare(y.date) || x.title.localeCompare(y.title, 'sv'))) {
    map.set(a.date, [...(map.get(a.date) ?? []), a])
  }
  return [...map.entries()]
}

export function SectionTitle({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <Typography
      sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: color ?? 'text.secondary', mb: 1 }}
    >
      {children}
    </Typography>
  )
}

export function DayGroups({ list, emptyText }: { list: ActivityDto[]; emptyText: string }) {
  if (list.length === 0) return <Empty text={emptyText} />
  return (
    <Stack spacing={3}>
      {groupByDate(list).map(([date, items]) => (
        <Box key={date}>
          <SectionTitle>{friendlyDate(date)}</SectionTitle>
          <Stack spacing={1}>
            {items.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
