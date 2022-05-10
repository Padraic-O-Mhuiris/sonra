import createDebug from 'debug'
import { zx } from './zodx'

export const log = createDebug('SONRA')

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function splitCategorisedAddress(
  c: zx.CategorisedAddress<string>,
): [string, zx.Address] {
  return c.split(':') as [string, zx.Address]
}
