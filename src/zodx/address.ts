import { ethers } from 'ethers'
import { boolean, z } from 'zod'
import { withGetType } from 'zod-to-ts'
import { categoryAddressType } from '../codegen/utils'

/**
 * This is the zod extended version of Address which ought to be used primarily
 * in the sonra config generation. It distinguishes from the generated Address
 * type variant for easier flexibility.
 * This type expresses two variants Address and Address<|category|>. The basic
 * variant, Address, is an expression of a constrained string which validates
 * as true in the below isAddress function. The categorised variant expresses
 * a string of pattern "<category>:0xabcd....7890". This is so we can
 * understand when we generate the files the category an address corresponds to
 * */
export type Address<T extends string = ''> = T extends ''
  ? string & {
      readonly __brand: 'Address'
    }
  : string & {
      readonly __brand: 'Address'
    } & {
      readonly __category: T
    }

export type AddressCategory<T extends Address<string>> = [T] extends [
  Address<infer U>,
]
  ? U
  : never

export type ZodAddress<T extends string = ''> = z.ZodType<Address<T>>

const isAddress = (val: string): val is Address => ethers.utils.isAddress(val)

const isCategorisedAddress = (val: string): val is Address<string> =>
  val.includes(':') &&
  val.split(':')[0].length !== 0 &&
  isAddress(val.split(':')[1]) &&
  val.split(':').length === 2

export const addressCategory = () =>
  z
    .string()
    .refine(isCategorisedAddress, {
      message: `Value is not a valid categorised address`,
    })
    .transform((val) => val.split(':')[0])

const isCategoryAddressTuple = (x: unknown): x is [string, Address] =>
  z.tuple([z.string(), address({ strict: false })]).safeParse(x).success

export const categoryAddressTuple = () =>
  z
    .string()
    .refine(isCategorisedAddress)
    .transform((val) => val.split(':'))
    .refine(isCategoryAddressTuple)

const isValidAddress = <T extends string = ''>(
  val: string,
  category?: T,
): val is Address<T> => {
  if (!category && isAddress(val)) {
    return true
  }

  const parsedAddressCategory = addressCategory().safeParse(val)

  return (
    !!category &&
    parsedAddressCategory.success &&
    parsedAddressCategory.data === category
  )
}

export const address = <T extends string = ''>(
  {
    category,
    strict,
  }: {
    category?: T | undefined
    strict?: boolean | undefined
  } = { strict: true },
): ZodAddress<T> => {
  const errorFn = (arg: any) => ({
    message: `Incorrect input to zx.address({ category: ${
      category ?? 'undefined'
    } }): ${arg}`,
  })

  console.log(category)
  const schema = strict
    ? z.custom<Address<T>>(
        (val) =>
          z
            .string()
            .refine((val) => isValidAddress(val, category))
            .safeParse(val).success,
        errorFn,
      )
    : z
        .custom<Address<T>>(
          (val) =>
            z
              .string()
              .refine((val) => isValidAddress(val, category))
              .safeParse(val).success,
          errorFn,
        )
        .transform((_address) =>
          _address.includes(':') ? _address.split(':')[1] : _address,
        )
        .refine((_address): _address is Address<T> =>
          isValidAddress(_address, category),
        )

  return withGetType<ZodAddress<T>>(schema, (ts) =>
    ts.factory.createIdentifier(
      category ? categoryAddressType(category) : 'Address',
    ),
  )
}
