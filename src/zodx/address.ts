import { ethers } from 'ethers'
import { z } from 'zod'
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

/**
 * basicAddress() will attempt to conform any string or a categorised address to
 * a simple address
 * */
export const basicAddress = (): ZodAddress =>
  withGetType<ZodAddress>(
    z
      .string()
      .transform((val) => {
        if (addressCategory().safeParse(val).success) {
          return val.split(':')[1]
        }
        return val
      })
      .refine(isAddress),
    (ts) => ts.factory.createIdentifier('Address'),
  )

const isCategoryAddressTuple = (x: unknown): x is [string, Address] =>
  z.tuple([z.string(), basicAddress()]).safeParse(x).success

export const categoryAddressTuple = () =>
  z
    .string()
    .refine(isCategorisedAddress)
    .transform((val) => val.split(':'))
    .refine(isCategoryAddressTuple)

const isValidAddress = (val: string, category?: string) => {
  if (!category && isAddress(val)) {
    return true
  }

  const parsedAddressCategory = addressCategory().safeParse(val)

  return (
    category &&
    parsedAddressCategory.success &&
    parsedAddressCategory.data === category
  )
}

export const address = <T extends string = ''>(
  _category?: T,
): ZodAddress<T> => {
  const errorCategoryStr = '"' + `${_category}` + '"'
  const errorFn = (arg: any) => ({
    message: `Incorrect input to zx.address(${
      _category ? errorCategoryStr : ''
    }): ${arg}`,
  })

  return withGetType<ZodAddress<T>>(
    z.custom<Address<T>>(
      (val) => z.string().refine(isValidAddress).safeParse(val).success,
      errorFn,
    ),
    (ts) =>
      ts.factory.createIdentifier(
        _category ? categoryAddressType(_category) : 'Address',
      ),
  )
}

export const categorisedAddress = <T extends string>(
  _category: T,
): ZodAddress<T> => {
  const errorCategoryStr = '"' + `${_category}` + '"'
  const errorFn = (arg: any) => ({
    message: `Incorrect input to zx.address(${errorCategoryStr}): ${arg}`,
  })

  return withGetType<ZodAddress<T>>(
    z.custom<Address<T>>(
      (val) =>
        z
          .string()
          .refine(isAddress)
          .transform((address) => `${_category}:${address}`)
          .refine(isCategorisedAddress)
          .safeParse(val).success,
      errorFn,
    ),
    (ts) => ts.factory.createIdentifier(categoryAddressType(_category)),
  )
}
