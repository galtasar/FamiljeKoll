import { useEffect, useState } from 'react'
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField,
} from '@mui/material'
import { Box, Stack, Typography } from './ui'

const COLORS = ['#E0694F', '#E2A336', '#C9B22B', '#5FA55A', '#2F9E8F', '#3B82C4', '#6C6FD1', '#8A63D2', '#D2639B', '#9A8A78']
const MEMBER_EMOJIS = ['👩', '👨', '👧', '👦', '👶', '🧒', '👵', '👴', '🐶', '🐱', '🦊', '🐼', '🦄', '🐸']
const CATEGORY_EMOJIS = ['🏠', '🧹', '🌱', '🚗', '🎒', '🍽️', '📌', '🛒', '🧺', '🐾', '⚽', '🎉', '💊', '📚', '🧸', '🔧']

export interface EditValue {
  name: string
  color: string
  emoji: string
  isArchived?: boolean
}

export function EditEntityDialog({
  open, title, kind, initial, onClose, onSave, onDelete, error,
}: {
  open: boolean
  title: string
  kind: 'member' | 'category'
  initial: EditValue
  onClose: () => void
  onSave: (v: EditValue) => void
  onDelete?: () => void
  error?: string | null
}) {
  const [v, setV] = useState(initial)
  useEffect(() => { if (open) setV(initial) }, [open, initial])
  const emojis = kind === 'member' ? MEMBER_EMOJIS : CATEGORY_EMOJIS

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} pt={0.5}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Namn" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoFocus slotProps={{ htmlInput: { maxLength: 50 } }} />
          <Box>
            <Typography variant="subtitle2" gutterBottom>Symbol</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {emojis.map((e) => (
                <Button
                  key={e}
                  onClick={() => setV({ ...v, emoji: e })}
                  variant={v.emoji === e ? 'contained' : 'outlined'}
                  color="secondary"
                  aria-label={e}
                  sx={{ minWidth: 48, width: 48, height: 48, fontSize: 24, p: 0 }}
                >
                  {e}
                </Button>
              ))}
            </Stack>
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Färg</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {COLORS.map((c) => (
                <Box
                  key={c}
                  role="button"
                  aria-label={`Färg ${c}`}
                  tabIndex={0}
                  onClick={() => setV({ ...v, color: c })}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setV({ ...v, color: c }) }}
                  sx={{
                    width: 44, height: 44, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                    border: v.color === c ? '4px solid #2D2A32' : '4px solid #fff', boxShadow: '0 0 0 1px #ccc',
                  }}
                />
              ))}
            </Stack>
          </Box>
          {v.isArchived !== undefined && (
            <FormControlLabel
              control={<Switch checked={v.isArchived} onChange={(e) => setV({ ...v, isArchived: e.target.checked })} />}
              label="Dölj (visas inte längre i val)"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        {onDelete ? <Button color="error" onClick={onDelete}>Ta bort</Button> : <span />}
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>Avbryt</Button>
          <Button variant="contained" onClick={() => onSave(v)} disabled={!v.name.trim() || !v.emoji || !v.color}>Spara</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
