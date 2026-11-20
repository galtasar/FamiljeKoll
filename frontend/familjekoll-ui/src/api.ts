import type { ActivityDto, Category, Frequency, Member, MemberPoints, PublicConfig, Me } from './types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  })
  if (!res.ok) {
    let message = 'Något gick fel. Försök igen.'
    try {
      const data = await res.json()
      if (typeof data?.error === 'string') message = data.error
      else if (typeof data?.title === 'string') message = data.title
    } catch {
      /* no body */
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export interface SaveActivity {
  title: string
  notes: string | null
  date: string
  points: number
  categoryId: string | null
  memberIds: string[]
  frequency?: Frequency | null
  interval?: number | null
  endDate?: string | null
}

export type SaveMember = Omit<Member, 'id'>
export type SaveCategory = Omit<Category, 'id'>

export const api = {
  publicConfig: () => request<PublicConfig>('GET', '/api/public-config'),
  me: () => request<Me>('GET', '/api/me'),
  members: () => request<Member[]>('GET', '/api/members?includeArchived=true'),
  createMember: (m: SaveMember) => request<Member>('POST', '/api/members', m),
  updateMember: (id: string, m: SaveMember) => request<Member>('PUT', `/api/members/${id}`, m),
  categories: () => request<Category[]>('GET', '/api/categories'),
  createCategory: (c: SaveCategory) => request<Category>('POST', '/api/categories', c),
  updateCategory: (id: string, c: SaveCategory) => request<Category>('PUT', `/api/categories/${id}`, c),
  deleteCategory: (id: string) => request<void>('DELETE', `/api/categories/${id}`),
  activities: (from: string, to: string) =>
    request<ActivityDto[]>('GET', `/api/activities?from=${from}&to=${to}`),
  upcoming: () => request<ActivityDto[]>('GET', '/api/activities/upcoming'),
  createActivity: (a: SaveActivity) => request<unknown>('POST', '/api/activities', a),
  updateActivity: (id: string, a: SaveActivity) => request<ActivityDto>('PUT', `/api/activities/${id}`, a),
  updateSeries: (id: string, a: SaveActivity) => request<ActivityDto[]>('PUT', `/api/activities/${id}/series`, a),
  deleteActivity: (id: string) => request<void>('DELETE', `/api/activities/${id}`),
  deleteSeries: (id: string) => request<void>('DELETE', `/api/activities/${id}/series`),
  setDone: (id: string, isDone: boolean, completedByMemberId: string | null) =>
    request<ActivityDto>('PATCH', `/api/activities/${id}/done`, { isDone, completedByMemberId }),
  points: (from?: string, to?: string) => {
    const q = new URLSearchParams()
    if (from) q.set('from', from)
    if (to) q.set('to', to)
    return request<MemberPoints[]>('GET', `/api/points?${q}`)
  },
}
