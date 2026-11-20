import { useMemo, useState } from 'react'
import {
  Button, Card, Chip, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import { Box, Stack, Typography } from '../ui'
import dayjs from 'dayjs'
import { useFamily } from '../family'
import { useCategoryActions, useMemberActions, usePoints } from '../hooks'
import { EditEntityDialog, type EditValue } from '../EditEntityDialog'
import { MemberAvatar } from '../bits'
import { ISO, startOfWeek } from '../dates'
import type { Category, Member } from '../types'

type Editing =
  | { kind: 'member'; item: Member | null }
  | { kind: 'category'; item: Category | null }
  | null

function PointsBoard() {
  const { members } = useFamily()
  const [range, setRange] = useState<'week' | 'all'>('week')
  const [from, to] = useMemo(() => {
    const s = startOfWeek(dayjs())
    return range === 'week' ? [s.format(ISO), s.add(6, 'day').format(ISO)] : [undefined, undefined]
  }, [range])
  const q = usePoints(from, to)
  const rows = members
    .filter((m) => !m.isArchived)
    .map((m) => ({ m, points: q.data?.find((p) => p.memberId === m.id)?.points ?? 0 }))
    .sort((a, b) => b.points - a.points)
  const max = Math.max(1, ...rows.map((r) => r.points))

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h5">Poäng</Typography>
        <ToggleButtonGroup size="small" exclusive value={range} onChange={(_, v) => v && setRange(v)}>
          <ToggleButton value="week">Veckan</ToggleButton>
          <ToggleButton value="all">Totalt</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Card sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {rows.length === 0 && <Typography color="text.secondary">Lägg till familjemedlemmar nedan.</Typography>}
          {rows.map(({ m, points }) => (
            <Stack key={m.id} direction="row" alignItems="center" spacing={1.5}>
              <MemberAvatar member={m} size={36} />
              <Box flex={1}>
                <Typography fontWeight={700}>{m.name}</Typography>
                <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#F0EEE9', overflow: 'hidden' }}>
                  <Box sx={{ height: 1, width: `${(points / max) * 100}%`, bgcolor: m.color, transition: 'width .4s' }} />
                </Box>
              </Box>
              <Typography variant="h6">{points}</Typography>
            </Stack>
          ))}
        </Stack>
      </Card>
    </Box>
  )
}

export function FamilyPage() {
  const { members, categories } = useFamily()
  const memberActions = useMemberActions()
  const categoryActions = useCategoryActions()
  const [editing, setEditing] = useState<Editing>(null)
  const [error, setError] = useState<string | null>(null)

  const close = () => { setEditing(null); setError(null) }
  const fail = (e: unknown) => setError(e instanceof Error ? e.message : 'Något gick fel.')
  const opts = { onSuccess: close, onError: fail }

  const initial = useMemo<EditValue>(() => {
    if (!editing) return { name: '', color: '#E0694F', emoji: '' }
    if (editing.kind === 'member')
      return editing.item
        ? { name: editing.item.name, color: editing.item.color, emoji: editing.item.emoji, isArchived: editing.item.isArchived }
        : { name: '', color: '#E0694F', emoji: '👧', isArchived: false }
    return editing.item
      ? { name: editing.item.name, color: editing.item.color, emoji: editing.item.emoji }
      : { name: '', color: '#2F9E8F', emoji: '📌' }
  }, [editing])

  const save = (v: EditValue) => {
    if (!editing) return
    if (editing.kind === 'member') {
      const data = { name: v.name.trim(), color: v.color, emoji: v.emoji, isArchived: !!v.isArchived, sortOrder: editing.item?.sortOrder ?? members.length }
      if (editing.item) memberActions.update.mutate({ id: editing.item.id, data }, opts)
      else memberActions.create.mutate(data, opts)
    } else {
      const data = { name: v.name.trim(), color: v.color, emoji: v.emoji, sortOrder: editing.item?.sortOrder ?? categories.length }
      if (editing.item) categoryActions.update.mutate({ id: editing.item.id, data }, opts)
      else categoryActions.create.mutate(data, opts)
    }
  }

  const deleteEntity = () => {
    if (!editing?.item) return
    if (editing.kind === 'category') {
      if (!window.confirm('Ta bort kategorin? Aktiviteter som använder den blir utan kategori.')) return
      categoryActions.remove.mutate(editing.item.id, opts)
    } else {
      if (!window.confirm('Ta bort medlemmen för alltid? Hen tas bort från alla aktiviteter och poängen försvinner. Vill du bara dölja hen, använd "Dölj" istället.')) return
      memberActions.remove.mutate(editing.item.id, opts)
    }
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h4">Familjen</Typography>
      <PointsBoard />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h5">Medlemmar</Typography>
          <Button variant="contained" onClick={() => setEditing({ kind: 'member', item: null })}>+ Ny</Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {members.map((m) => (
            <Chip
              key={m.id}
              onClick={() => setEditing({ kind: 'member', item: m })}
              label={`${m.emoji} ${m.name}${m.isArchived ? ' (dold)' : ''}`}
              sx={{ bgcolor: `color-mix(in srgb, ${m.color} 20%, #fff)`, border: `1px solid ${m.color}`, color: 'text.primary', minHeight: 40, fontSize: 15, opacity: m.isArchived ? 0.5 : 1 }}
            />
          ))}
        </Stack>
      </Box>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h5">Kategorier</Typography>
          <Button variant="contained" color="secondary" onClick={() => setEditing({ kind: 'category', item: null })}>+ Ny</Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              onClick={() => setEditing({ kind: 'category', item: c })}
              label={`${c.emoji} ${c.name}`}
              sx={{ bgcolor: `color-mix(in srgb, ${c.color} 20%, #fff)`, border: `1px solid ${c.color}`, color: 'text.primary', minHeight: 40, fontSize: 15 }}
            />
          ))}
        </Stack>
      </Box>

      <EditEntityDialog
        open={!!editing}
        kind={editing?.kind ?? 'member'}
        title={editing?.item ? 'Ändra' : editing?.kind === 'category' ? 'Ny kategori' : 'Ny medlem'}
        initial={initial}
        onClose={close}
        onSave={save}
        onDelete={editing?.item ? deleteEntity : undefined}
        error={error}
      />
    </Stack>
  )
}
