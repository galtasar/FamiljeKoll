import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ActivityDto, Category, Member } from './types'
import { useCategories, useMembers } from './hooks'

interface Filters {
  memberId: string | null
  categoryId: string | null
}

interface FamilyCtx {
  members: Member[]
  activeMembers: Member[]
  categories: Category[]
  memberById: (id: string | null | undefined) => Member | undefined
  categoryById: (id: string | null | undefined) => Category | undefined
  filters: Filters
  setFilters: (f: Filters) => void
  applyFilters: (list: ActivityDto[]) => ActivityDto[]
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
  const [filters, setFilters] = useState<Filters>({ memberId: null, categoryId: null })

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
      filters,
      setFilters,
      // Activities without members belong to the whole family and match every member filter.
      applyFilters: (list) =>
        list.filter(
          (a) =>
            (!filters.categoryId || a.categoryId === filters.categoryId) &&
            (!filters.memberId || a.memberIds.length === 0 || a.memberIds.includes(filters.memberId)),
        ),
      openActivity,
      loading: membersQ.isLoading || categoriesQ.isLoading,
    }
  }, [membersQ.data, membersQ.isLoading, categoriesQ.data, categoriesQ.isLoading, filters, openActivity])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFamily() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFamily must be used inside FamilyProvider')
  return v
}
