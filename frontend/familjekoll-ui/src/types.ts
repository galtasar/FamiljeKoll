export type Frequency = 'Days' | 'Weeks' | 'Months'

export interface Member {
  id: string
  name: string
  color: string
  sortOrder: number
  isArchived: boolean
}

export interface Category {
  id: string
  name: string
  color: string
  sortOrder: number
}

export interface ActivityDto {
  id: string
  title: string
  notes: string | null
  date: string
  isDone: boolean
  doneAt: string | null
  completedByMemberId: string | null
  points: number
  categoryId: string | null
  memberIds: string[]
  recurringPatternId: string | null
}

export interface MemberPoints {
  memberId: string
  points: number
}

export interface PublicConfig {
  providers: string[]
  authDisabled: boolean
}

export interface Me {
  email: string
  name: string
  allowed: boolean
}
