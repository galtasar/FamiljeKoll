import {
  Avatar, Chip,
} from '@mui/material'
import { Box, Stack, Typography } from './ui'
import type { Category, Member } from './types'

export function MemberAvatar({ member, size = 32 }: { member: Member; size?: number }) {
  return (
    <Avatar
      title={member.name}
      sx={{ width: size, height: size, bgcolor: member.color, fontSize: size * 0.58, border: '2px solid #fff' }}
    >
      {member.emoji}
    </Avatar>
  )
}

export function MemberStack({ members }: { members: Member[] }) {
  if (members.length === 0)
    return (
      <Typography variant="caption" color="text.secondary" component="span">
        👨‍👩‍👧‍👦 Alla
      </Typography>
    )
  return (
    <Stack direction="row" spacing={-0.5} alignItems="center">
      {members.slice(0, 5).map((m) => (
        <MemberAvatar key={m.id} member={m} size={28} />
      ))}
      {members.length > 5 && <Typography variant="caption">+{members.length - 5}</Typography>}
    </Stack>
  )
}

export function CategoryChip({ category }: { category?: Category }) {
  if (!category) return null
  return (
    <Chip
      size="small"
      label={`${category.emoji} ${category.name}`}
      sx={{ bgcolor: category.color + '33', color: 'text.primary', border: `1px solid ${category.color}` }}
    />
  )
}

export function Empty({ emoji, text }: { emoji: string; text: string }) {
  return (
    <Box textAlign="center" py={6} color="text.secondary">
      <Typography fontSize={56}>{emoji}</Typography>
      <Typography variant="h6">{text}</Typography>
    </Box>
  )
}
