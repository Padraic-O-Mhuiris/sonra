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

const isCategoryAddressTuple = (x: unknown): x is [string, Address] =>
  z.tuple([z.string(), conformAddress()]).safeParse(x).success

export const categoryAddressTuple = () =>
  z
    .string()
    .refine(isCategorisedAddress)
    .transform((val) => val.split(':'))
    .refine(isCategoryAddressTuple)

const strictAddressSchema = <T extends string = ''>(
  category?: T,
): ZodAddress<T> =>
  z
    .string()
    .superRefine((input, ctx): input is Address<T> => {
      const inputIsAddress = isAddress(input)
      const inputIsCategorisedAddress = isCategorisedAddress(input)

      if (category) {
        if (inputIsAddress)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Input '${input}' is a valid Address but expected categorised Address: '${category}:${input}'`,
            fatal: true,
          })
        if (inputIsCategorisedAddress) {
          const _inputCategory = input.split(':')[0]
          if (category !== _inputCategory)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Input '${input}' does not match this address category: ${category}`,
              fatal: true,
            })
        }
      } else {
        if (inputIsCategorisedAddress) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Input '${input}' matches a category Address but no category is expected`,
            fatal: true,
          })
        }
      }

      if (!inputIsAddress && !inputIsCategorisedAddress)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Input '${input}' is not a valid Address`,
          fatal: true,
        })

      return true
    })
    .refine((_address): _address is Address<T> => true)

const unstrictAddressSchema = <T extends string = ''>(
  category?: T,
): ZodAddress<T> =>
  z
    .string()
    .superRefine((input, ctx): input is Address<T> => {
      const inputIsAddress = isAddress(input)
      const inputIsCategorisedAddress = isCategorisedAddress(input)

      if (!inputIsAddress && !inputIsCategorisedAddress)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Input '${input}' could not be conformed to an Address`,
          fatal: true,
        })

      return true
    })
    .transform((_address) => {
      const normalizedAddress = _address.includes(':')
        ? _address.split(':')[1]
        : _address
      return category ? `${category}:${normalizedAddress}` : normalizedAddress
    })
    .refine((_address): _address is Address<T> => true)

export const address = <T extends string = ''>(
  category?: T,
  strict: boolean = true,
): ZodAddress<T> => {
  return withGetType<ZodAddress<T>>(
    strict ? strictAddressSchema(category) : unstrictAddressSchema(category),
    (ts) =>
      ts.factory.createIdentifier(
        category ? categoryAddressType(category) : 'Address',
      ),
  )
}

export const conformAddress = <T extends string = ''>(
  category?: T,
): ZodAddress<T> => address(category)
