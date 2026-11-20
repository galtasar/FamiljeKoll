import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'dayjs/locale/sv'
import type { Dayjs } from 'dayjs'

dayjs.extend(isoWeek)
dayjs.locale('sv') // Monday as first day of week

export const ISO = 'YYYY-MM-DD'

export const today = () => dayjs().format(ISO)

export const startOfWeek = (d: Dayjs) => d.startOf('week')

export function friendlyDate(iso: string): string {
  const d = dayjs(iso)
  const t = dayjs().startOf('day')
  const diff = d.startOf('day').diff(t, 'day')
  if (diff === 0) return 'Idag'
  if (diff === 1) return 'Imorgon'
  if (diff === -1) return 'Igår'
  const text = d.format('dddd D MMMM')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const isOverdue = (iso: string, done: boolean) => !done && iso < today()
