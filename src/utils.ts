import createLogger from 'pino'

export const logger = createLogger()

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const isUniqueArray = <F extends unknown, T extends F[] | [F, ...F[]]>(
  arr: T,
): boolean => new Set(arr).size === arr.length
