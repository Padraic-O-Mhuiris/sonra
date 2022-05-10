import createDebug from 'debug'
import { Address } from './address'

export const log = createDebug('SONRA')

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function splitCategorisedAddress(c: Address<string>): [string, Address] {
  return c.split(':') as [string, Address]
}
