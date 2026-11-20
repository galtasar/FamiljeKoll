import { Chip } from '@mui/material'
import { Box, Stack, Typography } from './ui'
import { useFamily } from './family'
import { ActivityCard } from './ActivityCard'
import { Dot, Empty } from './bits'
import { friendlyDate } from './dates'
import type { ActivityDto } from './types'

const pill = (on: boolean) => ({
  borderRadius: '999px',
  bgcolor: on ? 'primary.main' : 'background.paper',
  color: on ? '#fff' : 'text.primary',
  border: '1px solid',
  borderColor: on ? 'primary.main' : '#E1DED7',
  '&:hover': { bgcolor: on ? 'primary.main' : '#F4F2EE' },
  '& .MuiChip-icon': { ml: 1.25, mr: -0.5 },
})

export function FilterBar() {
  const { activeMembers, categories, filters, setFilters } = useFamily()
  return (
    <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
      <Chip
        label="Alla"
        onClick={() => setFilters({ memberId: null, categoryId: null })}
        sx={pill(!filters.memberId && !filters.categoryId)}
      />
      {activeMembers.map((m) => {
        const on = filters.memberId === m.id
        return (
          <Chip
            key={m.id}
            icon={<Dot color={m.color} />}
            label={m.name}
            onClick={() => setFilters({ ...filters, memberId: on ? null : m.id })}
            sx={pill(on)}
          />
        )
      })}
      {categories.length > 0 && <Box sx={{ width: '1px', height: 20, bgcolor: '#E1DED7', mx: 0.5 }} />}
      {categories.map((c) => {
        const on = filters.categoryId === c.id
        return (
          <Chip
            key={c.id}
            size="small"
            icon={<Dot color={c.color} size={8} />}
            label={c.name}
            onClick={() => setFilters({ ...filters, categoryId: on ? null : c.id })}
            sx={pill(on)}
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
