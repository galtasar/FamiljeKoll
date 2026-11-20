import { Avatar, Chip } from '@mui/material'
import { Box, Stack, Typography } from './ui'
import type { Category, Member } from './types'

export function MemberAvatar({ member, size = 28 }: { member: Member; size?: number }) {
  return (
    <Avatar
      title={member.name}
      sx={{ width: size, height: size, bgcolor: member.color, color: '#fff', fontSize: size * 0.42, fontWeight: 600, border: '2px solid #fff' }}
    >
      {member.name.trim().charAt(0).toUpperCase()}
    </Avatar>
  )
}

export function MemberStack({ members }: { members: Member[] }) {
  if (members.length === 0)
    return <Typography variant="caption" color="text.secondary" component="span">Hela familjen</Typography>
  return (
    <Stack direction="row" spacing={-0.5} alignItems="center">
      {members.slice(0, 5).map((m) => <MemberAvatar key={m.id} member={m} size={24} />)}
      {members.length > 5 && <Typography variant="caption" ml={1}>+{members.length - 5}</Typography>}
    </Stack>
  )
}

export function Dot({ color, size = 9 }: { color: string; size?: number }) {
  return <Box component="span" sx={{ width: size, height: size, borderRadius: '50%', bgcolor: color, display: 'inline-block', flex: 'none' }} />
}

export function CategoryChip({ category }: { category?: Category }) {
  if (!category) return null
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" component="span">
      <Dot color={category.color} />
      <Typography variant="caption" color="text.secondary" component="span">{category.name}</Typography>
    </Stack>
  )
}

export function PointsTag({ points }: { points: number }) {
  if (points <= 0) return null
  return <Chip size="small" label={`${points} p`} sx={{ bgcolor: '#E7F1EE', color: 'secondary.main', fontWeight: 600, height: 22 }} />
}

export function Empty({ text }: { text: string }) {
  return (
    <Box textAlign="center" py={8} color="text.secondary">
      <Typography>{text}</Typography>
    </Box>
  )
}
