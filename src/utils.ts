import pino from 'pino'

export const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } },
})

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const isUniqueArray = <F extends unknown, T extends F[] | [F, ...F[]]>(
  arr: T,
): boolean => new Set(arr).size === arr.length

export function isTypescriptFile(path: string): boolean {
  return path.endsWith('.ts')
}
