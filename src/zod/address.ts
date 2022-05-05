import { ethers } from 'ethers'
import { z } from 'zod'

export type Address = string & { readonly __brand: 'Address' }

const isAddress = (x: string): x is Address => ethers.utils.isAddress(x)

export type ZodAddress = z.ZodType<Address>

const _address: ZodAddress = z.string().refine(isAddress)

export type CategorisedAddress<T extends string> = Address & {
  readonly __category: T
}

export type ZodCategorisedAddress<T extends string> = z.ZodType<
  CategorisedAddress<T>
>

// custom address type of the structure <tag>:<address>
export const categoriseAddress = <T extends string>(
  _tag: T,
): ZodCategorisedAddress<T> =>
  z.custom<CategorisedAddress<T>>(
    (val) =>
      z
        .string()
        .refine((_val) => {
          if (!_val.includes(':')) return false

          const [tag, addressString] = _val.split(':')
          if (tag !== _tag) return false

          return _address.safeParse(addressString).success
        })
        .safeParse(val).success,
  )

export const address = <T extends string | undefined = undefined>(
  tag?: T,
): T extends string ? ZodCategorisedAddress<T> : ZodAddress => {
  if (tag) {
    return categoriseAddress(tag) as T extends string
      ? ZodCategorisedAddress<T>
      : never
  }

  return _address as T extends string ? never : ZodAddress
}
