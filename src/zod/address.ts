import { ethers } from 'ethers'
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'
import { categoryAddressType } from '../codegen/utils'

export type Address = string & { readonly __zod: 'Address' }

const isAddress = (x: string): x is Address => ethers.utils.isAddress(x)

export type ZodAddress = z.ZodType<Address>

const _address: ZodAddress = withGetType<ZodAddress>(
  z.string().refine(isAddress),
  (ts) => ts.factory.createIdentifier('Address'),
)

export type CategorisedAddress<T extends string> = Address & {
  readonly __category: T
}

export type ZodCategorisedAddress<T extends string> = z.ZodType<
  CategorisedAddress<T>
>

// custom address type of the structure <tag>:<address>
export const categoriseAddress = <T extends string>(
  _category: T,
): ZodCategorisedAddress<T> =>
  withGetType<ZodCategorisedAddress<T>>(
    z.custom<CategorisedAddress<T>>(
      (val) =>
        z
          .string()
          .refine((_val) => {
            if (!_val.includes(':')) return false
            const [category, addressString] = _val.split(':')
            if (category !== _category) return false

            return _address.safeParse(addressString).success
          })
          .safeParse(val).success,
    ),
    (ts) => ts.factory.createIdentifier(categoryAddressType(_category)),
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

export function splitCategorisedAddress(
  c: CategorisedAddress<string>,
): [string, Address] {
  return c.split(':') as [string, Address]
}
