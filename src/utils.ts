import path from 'path'
import pino from 'pino'
import { zx } from './zodx'

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

export const normalizeAbsPath = (_path: string): string => {
  const cwd = process.cwd()
  if (_path.startsWith(cwd)) {
    return _path
  }
  return path.join(cwd, _path)
}

export const mkCategoryAddressType = (category: string): string =>
  `${capitalize(category)}Address`

export const mkCategoryFilePath = (
  categoryDir: string,
  category: string,
): string => path.join(categoryDir, `${category}.ts`)

export function mkAddressConstant(
  category: string,
  address: zx.Address | undefined = undefined,
): string {
  if (!address) {
    return `${category}Address`
  }
  return `${mkAddressConstant(category)}_${address.slice(0, 6)}`
}
