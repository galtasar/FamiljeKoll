import { useState } from 'react'
import { Button, Dialog, DialogContent, DialogTitle, Tooltip } from '@mui/material'
import { Box, Stack, Typography } from './ui'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded'
import { useFamily } from './family'
import { useActivityActions } from './hooks'
import { CategoryChip, MemberStack, PointsTag } from './bits'
import { isOverdue } from './dates'
import type { ActivityDto } from './types'

function Check({ done, size, onClick, disabled }: { done: boolean; size: number; onClick: () => void; disabled?: boolean }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={done ? 'Ångra klar' : 'Markera som klar'}
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      sx={{
        width: size, height: size, flex: 'none', borderRadius: '50%', p: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
        border: '2px solid', borderColor: done ? 'secondary.main' : '#C9C5BD',
        bgcolor: done ? 'secondary.main' : 'transparent', color: done ? '#fff' : 'transparent',
        '&:hover': { borderColor: 'secondary.main', color: done ? '#fff' : 'secondary.main' },
      }}
    >
      <CheckRoundedIcon sx={{ fontSize: size * 0.65 }} />
    </Box>
  )
}

export function ActivityCard({ activity: a, compact = false }: { activity: ActivityDto; compact?: boolean }) {
  const { memberById, categoryById, activeMembers, openActivity } = useFamily()
  const { setDone } = useActivityActions()
  const [asking, setAsking] = useState(false)

  const category = categoryById(a.categoryId)
  const members = a.memberIds.map((id) => memberById(id)).filter((m) => !!m)
  const overdue = isOverdue(a.date, a.isDone)
  const accent = category?.color ?? '#B9B4AB'
  const doneBy = memberById(a.completedByMemberId)

  const toggle = () => {
    if (a.isDone) return setDone.mutate({ id: a.id, isDone: false, by: null })
    // Nobody is responsible: ask who did it so the points end up with the right person.
    if (a.memberIds.length === 0 && a.points > 0 && activeMembers.length > 0) return setAsking(true)
    setDone.mutate({ id: a.id, isDone: true, by: null })
  }

  const title = (
    <Typography
      sx={{
        fontWeight: 500, fontSize: compact ? 13 : 16, lineHeight: 1.3, wordBreak: 'break-word',
        textDecoration: a.isDone ? 'line-through' : 'none',
      }}
    >
      {a.title}
    </Typography>
  )

  return (
    <>
      {compact ? (
        <Box
          draggable
          onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData('text/plain', a.id); e.dataTransfer.effectAllowed = 'move' }}
          onClick={() => openActivity(a)}
          sx={{
            display: 'flex', gap: 1, alignItems: 'flex-start', p: '7px 8px', borderRadius: '8px',
            bgcolor: `color-mix(in srgb, ${accent} 14%, #fff)`, borderLeft: `3px solid ${accent}`, cursor: 'grab',
            opacity: a.isDone ? 0.55 : 1,
          }}
        >
          <Check done={a.isDone} size={20} onClick={toggle} disabled={setDone.isPending} />
          <Box minWidth={0} flex={1}>
            {title}
            <Typography variant="caption" color="text.secondary" display="block">
              {members.length ? members.map((m) => m.name).join(', ') : 'Hela familjen'}
              {a.recurringPatternId ? ' · återkommande' : ''}
              {overdue ? ' · försenad' : ''}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={() => openActivity(a)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.75, p: 1.75, bgcolor: 'background.paper', cursor: 'pointer',
            border: '1px solid', borderColor: overdue ? '#EBC9C1' : 'divider', borderLeft: `4px solid ${accent}`, borderRadius: '12px',
            opacity: a.isDone ? 0.6 : 1,
            '&:hover': { borderColor: 'text.secondary', borderLeftColor: accent },
          }}
        >
          <Check done={a.isDone} size={28} onClick={toggle} disabled={setDone.isPending} />
          <Box minWidth={0} flex={1}>
            {title}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap mt={0.5}>
              <CategoryChip category={category} />
              <MemberStack members={members} />
              <PointsTag points={a.points} />
              {a.recurringPatternId && (
                <Tooltip title="Återkommande"><RepeatRoundedIcon sx={{ fontSize: 16 }} color="action" /></Tooltip>
              )}
              {overdue && <Typography variant="caption" color="error" fontWeight={600}>Försenad</Typography>}
              {a.isDone && doneBy && <Typography variant="caption" color="text.secondary">Klar av {doneBy.name}</Typography>}
            </Stack>
          </Box>
        </Box>
      )}

      <Dialog open={asking} onClose={() => setAsking(false)}>
        <DialogTitle>Vem gjorde det?</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(110px, 1fr))" gap={1.5} pb={1}>
            {activeMembers.map((m) => (
              <Button
                key={m.id}
                variant="outlined"
                onClick={() => {
                  setAsking(false)
                  setDone.mutate({ id: a.id, isDone: true, by: m.id })
                }}
                sx={{ flexDirection: 'column', py: 1.5, gap: 0.75, color: 'text.primary', borderColor: 'divider' }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: m.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600 }}>
                  {m.name.trim().charAt(0).toUpperCase()}
                </Box>
                {m.name}
              </Button>
            ))}
          </Box>
          <Button fullWidth onClick={() => { setAsking(false); setDone.mutate({ id: a.id, isDone: true, by: null }) }}>
            Hoppa över
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
