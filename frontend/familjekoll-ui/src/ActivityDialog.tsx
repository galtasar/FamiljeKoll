import { useEffect, useState } from 'react'
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField,
} from '@mui/material'
import { Box, Stack, Typography } from './ui'
import { useFamily } from './family'
import { useActivityActions } from './hooks'
import { today } from './dates'
import type { SaveActivity } from './api'
import type { ActivityDto, Frequency } from './types'

export type DialogTarget = ActivityDto | { date?: string }

const isExisting = (t: DialogTarget): t is ActivityDto => 'id' in t
const POINT_CHOICES = [0, 1, 2, 3, 5, 10]
const UNIT: Record<Frequency, string> = { Days: 'dag', Weeks: 'vecka', Months: 'månad' }

type Pending = { kind: 'save'; data: SaveActivity } | { kind: 'delete' }

export function ActivityDialog({ target, onClose }: { target: DialogTarget | null; onClose: () => void }) {
  const { activeMembers, categories } = useFamily()
  const actions = useActivityActions()

  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(today())
  const [points, setPoints] = useState(0)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [repeat, setRepeat] = useState(false)
  const [frequency, setFrequency] = useState<Frequency>('Weeks')
  const [interval, setIntervalValue] = useState(1)
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)

  useEffect(() => {
    if (!target) return
    setError(null)
    setPending(null)
    if (isExisting(target)) {
      setTitle(target.title)
      setNotes(target.notes ?? '')
      setDate(target.date)
      setPoints(target.points)
      setCategoryId(target.categoryId)
      setMemberIds(target.memberIds)
    } else {
      setTitle('')
      setNotes('')
      setDate(target.date ?? today())
      setPoints(0)
      setCategoryId(null)
      setMemberIds([])
    }
    setRepeat(false)
    setFrequency('Weeks')
    setIntervalValue(1)
    setEndDate('')
  }, [target])

  if (!target) return null
  const existing = isExisting(target) ? target : null
  const inSeries = !!existing?.recurringPatternId
  const busy = actions.create.isPending || actions.update.isPending || actions.remove.isPending

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : 'Något gick fel.')

  const buildData = (): SaveActivity | null => {
    if (!title.trim()) {
      setError('Skriv vad som ska göras.')
      return null
    }
    if (!date) {
      setError('Välj ett datum.')
      return null
    }
    if (repeat && endDate && endDate < date) {
      setError('Slutdatum kan inte vara före startdatum.')
      return null
    }
    const data: SaveActivity = {
      title: title.trim(),
      notes: notes.trim() || null,
      date,
      points,
      categoryId,
      memberIds,
    }
    if (!existing && repeat) {
      data.frequency = frequency
      data.interval = Math.max(1, interval)
      data.endDate = endDate || null
    }
    return data
  }

  const save = () => {
    const data = buildData()
    if (!data) return
    if (existing && inSeries) return setPending({ kind: 'save', data })
    run(data, false)
  }

  const run = (data: SaveActivity, series: boolean) => {
    const done = { onSuccess: onClose, onError: fail }
    if (existing) actions.update.mutate({ id: existing.id, data, series }, done)
    else actions.create.mutate(data, done)
  }

  const remove = (series: boolean) => {
    if (!existing) return
    actions.remove.mutate({ id: existing.id, series }, { onSuccess: onClose, onError: fail })
  }

  const toggleMember = (id: string) =>
    setMemberIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  return (
    <>
      <Dialog open onClose={onClose} fullScreen={false} scroll="paper">
        <DialogTitle>{existing ? 'Ändra aktivitet' : 'Ny aktivitet ✨'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} pt={0.5}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Vad ska göras?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus={!existing}
              slotProps={{ htmlInput: { maxLength: 120 } }}
              required
            />
            <TextField
              label="Datum"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>Vem? (tomt = hela familjen)</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {activeMembers.map((m) => {
                  const on = memberIds.includes(m.id)
                  return (
                    <Chip
                      key={m.id}
                      label={`${m.emoji} ${m.name}`}
                      onClick={() => toggleMember(m.id)}
                      sx={{
                        bgcolor: on ? m.color : 'transparent',
                        border: `2px solid ${m.color}`,
                        color: 'text.primary',
                        '&:hover': { bgcolor: on ? m.color : m.color + '44' },
                      }}
                    />
                  )
                })}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Kategori</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {categories.map((c) => {
                  const on = categoryId === c.id
                  return (
                    <Chip
                      key={c.id}
                      label={`${c.emoji} ${c.name}`}
                      onClick={() => setCategoryId(on ? null : c.id)}
                      sx={{
                        bgcolor: on ? c.color : 'transparent',
                        border: `2px solid ${c.color}`,
                        color: 'text.primary',
                        '&:hover': { bgcolor: on ? c.color : c.color + '44' },
                      }}
                    />
                  )
                })}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Poäng ⭐</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {POINT_CHOICES.map((p) => (
                  <Chip
                    key={p}
                    label={p === 0 ? 'Inga' : p}
                    color={points === p ? 'secondary' : 'default'}
                    variant={points === p ? 'filled' : 'outlined'}
                    onClick={() => setPoints(p)}
                  />
                ))}
              </Stack>
            </Box>

            {!existing && (
              <Box>
                <Chip
                  label={repeat ? '🔁 Upprepas' : '🔁 Upprepa…'}
                  color={repeat ? 'secondary' : 'default'}
                  variant={repeat ? 'filled' : 'outlined'}
                  onClick={() => setRepeat((r) => !r)}
                />
                {repeat && (
                  <Stack direction="row" spacing={1.5} mt={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography>Var</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={interval}
                      onChange={(e) => setIntervalValue(Number(e.target.value))}
                      sx={{ width: 80 }}
                      slotProps={{ htmlInput: { min: 1, max: 365 } }}
                    />
                    <TextField select size="small" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
                      {(Object.keys(UNIT) as Frequency[]).map((f) => (
                        <MenuItem key={f} value={f}>{UNIT[f]}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Till och med (valfritt)"
                      type="date"
                      size="small"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>
                )}
              </Box>
            )}
            {inSeries && (
              <Typography variant="body2" color="text.secondary">🔁 Den här aktiviteten är en del av en serie.</Typography>
            )}

            <TextField
              label="Anteckning (valfritt)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={2}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          {existing ? (
            <Button color="error" onClick={() => (inSeries ? setPending({ kind: 'delete' }) : remove(false))} disabled={busy}>
              Ta bort
            </Button>
          ) : <span />}
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose}>Avbryt</Button>
            <Button variant="contained" onClick={save} disabled={busy}>Spara</Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog open={!!pending} onClose={() => setPending(null)} maxWidth="xs">
        <DialogTitle>{pending?.kind === 'delete' ? 'Ta bort återkommande' : 'Ändra återkommande'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Button
              variant="outlined"
              onClick={() => {
                const p = pending
                setPending(null)
                if (p?.kind === 'save') run(p.data, false)
                else remove(false)
              }}
            >
              Bara denna
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const p = pending
                setPending(null)
                if (p?.kind === 'save') run(p.data, true)
                else remove(true)
              }}
            >
              Denna och kommande
            </Button>
            <Button onClick={() => setPending(null)}>Avbryt</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
