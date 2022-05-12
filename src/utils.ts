import createDebug from 'debug'
import { Address } from './address'

export const log = createDebug('SONRA')

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export type AddressCategory<T extends Address<string>> = [T] extends [
  Address<infer U>,
]
  ? U
  : never

export function splitAddress<T extends Address<string>>(
  c: T,
): [AddressCategory<T>, Address] {
  return c.split(':') as [AddressCategory<T>, Address]
}

export const isUniqueArray = <F extends unknown, T extends F[] | [F, ...F[]]>(
  arr: T,
): boolean => new Set(arr).size === arr.length
