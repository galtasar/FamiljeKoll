import { useState } from 'react'
import {
  Button, Card, CardActionArea, Chip, Dialog, DialogContent, DialogTitle, IconButton,
} from '@mui/material'
import { Box, Stack, Typography } from './ui'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded'
import { useFamily } from './family'
import { useActivityActions } from './hooks'
import { CategoryChip, MemberStack } from './bits'
import { isOverdue } from './dates'
import type { ActivityDto } from './types'

export function ActivityCard({ activity: a }: { activity: ActivityDto }) {
  const { memberById, categoryById, activeMembers, openActivity } = useFamily()
  const { setDone } = useActivityActions()
  const [asking, setAsking] = useState(false)

  const category = categoryById(a.categoryId)
  const members = a.memberIds.map((id) => memberById(id)).filter((m) => !!m)
  const overdue = isOverdue(a.date, a.isDone)
  const stripe = category?.color ?? '#C9C3D0'
  const doneBy = memberById(a.completedByMemberId)

  const toggle = () => {
    if (a.isDone) return setDone.mutate({ id: a.id, isDone: false, by: null })
    // Nobody is responsible: ask who did it so the points end up with the right person.
    if (a.memberIds.length === 0 && a.points > 0 && activeMembers.length > 0) return setAsking(true)
    setDone.mutate({ id: a.id, isDone: true, by: null })
  }

  return (
    <>
      <Card
        sx={{
          borderLeft: `8px solid ${stripe}`,
          opacity: a.isDone ? 0.7 : 1,
          bgcolor: a.isDone ? '#F1FAF4' : overdue ? '#FFF1EE' : 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} p={1.5}>
          <IconButton
            aria-label={a.isDone ? 'Ångra klar' : 'Markera som klar'}
            onClick={toggle}
            disabled={setDone.isPending}
            sx={{
              width: 56,
              height: 56,
              border: '3px solid',
              borderColor: a.isDone ? 'success.main' : 'divider',
              bgcolor: a.isDone ? 'success.main' : 'transparent',
              color: a.isDone ? '#fff' : 'transparent',
              '&:hover': { bgcolor: a.isDone ? 'success.dark' : '#E6F6EC', color: a.isDone ? '#fff' : 'success.main' },
            }}
          >
            <CheckRoundedIcon fontSize="large" />
          </IconButton>
          <CardActionArea onClick={() => openActivity(a)} sx={{ flex: 1, borderRadius: 2, p: 0.5 }}>
            <Typography
              variant="h6"
              sx={{ textDecoration: a.isDone ? 'line-through' : 'none', wordBreak: 'break-word', lineHeight: 1.25 }}
            >
              {a.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mt={0.5}>
              <MemberStack members={members} />
              <CategoryChip category={category} />
              {a.points > 0 && <Chip size="small" label={`⭐ ${a.points}`} sx={{ bgcolor: '#FFF3C4' }} />}
              {a.recurringPatternId && <RepeatRoundedIcon fontSize="small" titleAccess="Återkommande" color="action" />}
              {overdue && <Chip size="small" color="error" label="Försenad" />}
              {a.isDone && doneBy && <Typography variant="caption">Klar av {doneBy.emoji} {doneBy.name}</Typography>}
            </Stack>
          </CardActionArea>
        </Stack>
      </Card>

      <Dialog open={asking} onClose={() => setAsking(false)}>
        <DialogTitle>Vem gjorde det? 🙋</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={1.5} pb={1}>
            {activeMembers.map((m) => (
              <Button
                key={m.id}
                variant="contained"
                onClick={() => {
                  setAsking(false)
                  setDone.mutate({ id: a.id, isDone: true, by: m.id })
                }}
                sx={{ bgcolor: m.color, color: '#2D2A32', flexDirection: 'column', py: 1.5, borderRadius: '20px', '&:hover': { bgcolor: m.color, filter: 'brightness(.95)' } }}
              >
                <span style={{ fontSize: 32 }}>{m.emoji}</span>
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
