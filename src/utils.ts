import { debug } from 'debug'

export const log = debug('SONRA')

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
