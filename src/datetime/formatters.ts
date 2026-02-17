import type { DateTime } from './delegate.js'

export type Formatter = (date: Date, datetime: DateTime) => string

function pad(number: number): string {
  return number
    .toString()
    .padStart(2, '0')
}

export const formatters: Record<string, Formatter> = {
  'iso-date': (date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  },
  'iso-datetime': (date: Date, datetime: DateTime): string => {
    return `${formatters['iso-date'](date, datetime)}T${formatters['iso-time'](date, datetime)}`
  },
  'iso-time': (date: Date): string => {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  },
  'iso-utc': (date: Date): string => {
    return `${date.toISOString().slice(0, 16)}Z`
  },
  'locale-date': (date: Date, datetime: DateTime): string => {
    return date.toLocaleString(datetime.language, {
      dateStyle: 'short',
    })
  },
  'locale-datetime': (date: Date, datetime: DateTime): string => {
    return date.toLocaleString(datetime.language, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  },
  'locale-time': (date: Date, datetime: DateTime): string => {
    return date.toLocaleString(datetime.language, {
      timeStyle: 'short',
    })
  },
}
