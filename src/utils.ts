import createDebug from 'debug'

export const log = createDebug('SONRA')

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
