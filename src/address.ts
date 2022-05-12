import { AddressCategory, splitAddress } from './utils'
import { zx } from './zodx'

export const addressify = <T extends string | undefined = undefined>(
  _address: string,
  _category?: T,
): T extends string ? Address<T> : Address => {
  return zx
    .address(_category)
    .parse(
      _category ? `${_category}:${_address}` : _address,
    ) as T extends string ? Address<T> : Address
}

export type Address<T extends string = ''> = T extends ''
  ? string & {
      readonly __brand: 'Address'
    }
  : string & {
      readonly __brand: 'Address'
    } & {
      readonly __category: T
    }

export type AddressRecord<V> = {
  [k in Address]: V
}

export const reifyAddress = <T extends Address<string>>(address: T): Address =>
  splitAddress(address)[1]

export const addressCategory = <T extends Address<string>>(
  address: T,
): AddressCategory<T> => splitAddress(address)[0]
