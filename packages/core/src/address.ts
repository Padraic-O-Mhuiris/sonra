import { ethers } from 'ethers'
import { z } from 'zod'

export type Address = string & { readonly __brand: 'address' }

export const isAddress = (x: string): x is Address => ethers.utils.isAddress(x)

export const addressSchema = z.string().refine(isAddress)

export type AddressSchema = typeof addressSchema

export const addressArraySchema = addressSchema.array()

export type AddressArraySchema = typeof addressArraySchema

export type CategorisedAddress<T extends string> = Address & {
  readonly __category: T
}

// custom address type of the structure <category>:<address>
export const createCategorisedAddress = <C extends string>(category: C) =>
  z.custom<CategorisedAddress<C>>(
    (val) =>
      z
        .string()
        .refine((_val) => {
          if (!_val.includes(':')) return false

          const [cat, address] = _val.split(':')
          if (cat !== category) return false

          return addressSchema.safeParse(address).success
        })
        .safeParse(val).success,
  )

export type CategorisedAddressSchema<T extends string> = z.ZodType<
  CategorisedAddress<T>
>
