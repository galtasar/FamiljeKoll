import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type SaveActivity, type SaveCategory, type SaveMember } from './api'

export const useMembers = () => useQuery({ queryKey: ['members'], queryFn: api.members })
export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: api.categories })
export const useRange = (from: string, to: string) =>
  useQuery({ queryKey: ['activities', 'range', from, to], queryFn: () => api.activities(from, to) })
export const useUpcoming = () => useQuery({ queryKey: ['activities', 'upcoming'], queryFn: api.upcoming })
export const usePoints = (from?: string, to?: string) =>
  useQuery({ queryKey: ['points', from, to], queryFn: () => api.points(from, to) })

// Activities, points and (for category deletion) everything may change together – keep it simple.
function useInvalidate(keys: string[]) {
  const qc = useQueryClient()
  return () => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })))
}

export function useActivityActions() {
  const invalidate = useInvalidate(['activities', 'points'])
  const opts = { onSuccess: invalidate }
  return {
    create: useMutation({ mutationFn: (a: SaveActivity) => api.createActivity(a), ...opts }),
    update: useMutation({
      mutationFn: async (v: { id: string; data: SaveActivity; series: boolean }) => {
        if (v.series) await api.updateSeries(v.id, v.data)
        else await api.updateActivity(v.id, v.data)
      },
      ...opts,
    }),
    remove: useMutation({
      mutationFn: (v: { id: string; series: boolean }) =>
        v.series ? api.deleteSeries(v.id) : api.deleteActivity(v.id),
      ...opts,
    }),
    setDone: useMutation({
      mutationFn: (v: { id: string; isDone: boolean; by: string | null }) => api.setDone(v.id, v.isDone, v.by),
      ...opts,
    }),
  }
}

export function useMemberActions() {
  const invalidate = useInvalidate(['members', 'activities', 'points'])
  const opts = { onSuccess: invalidate }
  return {
    create: useMutation({ mutationFn: (m: SaveMember) => api.createMember(m), ...opts }),
    update: useMutation({ mutationFn: (v: { id: string; data: SaveMember }) => api.updateMember(v.id, v.data), ...opts }),
  }
}

export function useCategoryActions() {
  const invalidate = useInvalidate(['categories', 'activities'])
  const opts = { onSuccess: invalidate }
  return {
    create: useMutation({ mutationFn: (c: SaveCategory) => api.createCategory(c), ...opts }),
    update: useMutation({ mutationFn: (v: { id: string; data: SaveCategory }) => api.updateCategory(v.id, v.data), ...opts }),
    remove: useMutation({ mutationFn: (id: string) => api.deleteCategory(id), ...opts }),
  }
}
