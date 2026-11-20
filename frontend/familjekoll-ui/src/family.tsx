import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ActivityDto, Category, Member } from './types'
import { useCategories, useMembers } from './hooks'

interface FamilyCtx {
  members: Member[]
  activeMembers: Member[]
  categories: Category[]
  memberById: (id: string | null | undefined) => Member | undefined
  categoryById: (id: string | null | undefined) => Category | undefined
  openActivity: (a: ActivityDto | { date?: string } | null) => void
  loading: boolean
}

const Ctx = createContext<FamilyCtx | null>(null)

export function FamilyProvider({
  children,
  openActivity,
}: {
  children: ReactNode
  openActivity: FamilyCtx['openActivity']
}) {
  const membersQ = useMembers()
  const categoriesQ = useCategories()

  const value = useMemo<FamilyCtx>(() => {
    const members = membersQ.data ?? []
    const categories = categoriesQ.data ?? []
    const activeMembers = members.filter((m) => !m.isArchived)
    return {
      members,
      activeMembers,
      categories,
      memberById: (id) => members.find((m) => m.id === id),
      categoryById: (id) => categories.find((c) => c.id === id),
      openActivity,
      loading: membersQ.isLoading || categoriesQ.isLoading,
    }
  }, [membersQ.data, membersQ.isLoading, categoriesQ.data, categoriesQ.isLoading, openActivity])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFamily() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFamily must be used inside FamilyProvider')
  return v
}
