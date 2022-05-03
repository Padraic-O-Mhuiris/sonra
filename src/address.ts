import { ethers } from 'ethers'
import { z } from 'zod'

export type Address = string & { readonly __brand: 'address' }

export const isAddress = (x: string): x is Address => ethers.utils.isAddress(x)

export const addressSchema = z.string().refine(isAddress)

export type AddressSchema = typeof addressSchema

export const addressArraySchema = addressSchema.array()

export type AddressArraySchema = typeof addressArraySchema

export type TagAddress<T extends string> = Address & {
  readonly __tag: T
}

export const zeroAddress = addressSchema.parse(ethers.constants.AddressZero)

// custom address type of the structure <tag>:<address>
export const createTaggedAddressSchema = <T extends string>(_tag: T) =>
  z.custom<TagAddress<T>>(
    (val) =>
      z
        .string()
        .refine((_val) => {
          if (!_val.includes(':')) return false

          const [tag, address] = _val.split(':')
          if (tag !== _tag) return false

          return addressSchema.safeParse(address).success
        })
        .safeParse(val).success,
  )

export type TaggedAddressSchema<T extends string> = z.ZodType<TagAddress<T>>

export const randomAddress = () =>
  addressSchema.parse(ethers.Wallet.createRandom().address)

export const createTagAddress = <T extends string, A extends Address>(
  tag: T,
  address: A,
): TagAddress<T> => `${tag}:${address}` as unknown as TagAddress<T>

export const randomTagAddress = <T extends string>(tag: T): TagAddress<T> =>
  createTagAddress(tag, randomAddress())
