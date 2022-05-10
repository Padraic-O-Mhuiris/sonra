import { zx } from './zodx'

export const addressify = <T extends string | undefined = undefined>(
  _address: string,
  _tag?: T,
): T extends string ? zx.CategorisedAddress<T> : zx.Address => {
  if (_tag) {
    return zx
      .categoriseAddress(_tag)
      .parse(`${_tag}:${_address}`) as T extends string
      ? zx.CategorisedAddress<T>
      : never
  }

  return zx.address().parse(_address) as T extends string ? never : zx.Address
}
