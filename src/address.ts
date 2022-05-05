import { address, Address, CategorisedAddress, categoriseAddress } from './zod'

export const createAddress = <T extends string | undefined = undefined>(
  _address: string,
  _tag?: T,
): T extends string ? CategorisedAddress<T> : Address => {
  if (_tag) {
    return categoriseAddress(_tag).parse(
      `${_tag}:${_address}`,
    ) as T extends string ? CategorisedAddress<T> : never
  }

  return address().parse(_address) as T extends string ? never : Address
}
