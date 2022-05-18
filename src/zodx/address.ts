import { ethers } from 'ethers'
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'
import { categoryAddressType } from '../codegen/utils'

export type Address = string & {
  readonly __brand: 'SonraAddress'
}

export type CategorisedAddress<T extends string> = Address & {
  readonly __category: T
}

export type ZodAddress = z.ZodType<Address>

export type ZodCategorisedAddress<T extends string> = z.ZodType<
  CategorisedAddress<T>
>

const isAddress = (val: string): val is Address => ethers.utils.isAddress(val)

const isCategorisedAddress = (val: string): val is CategorisedAddress<string> =>
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

// const isCategoryAddressTuple = (x: unknown): x is [string, Address] =>
//   z.tuple([z.string(), address(false)]).safeParse(x).success

export const categoryAddressTuple = () =>
  z
    .string()
    .refine(isCategorisedAddress)
    .transform((val) => val.split(':'))
    .refine((x): x is [string, Address] => true)

export const address = (conform: boolean = false): ZodAddress => {
  return withGetType<ZodAddress>(
    conform
      ? z
          .string()
          .superRefine((input, ctx) => {
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
          .transform((_address) =>
            _address.includes(':') ? _address.split(':')[1] : _address,
          )
          .refine((_address): _address is Address => true)
      : z
          .string()
          .superRefine((input, ctx) => {
            if (isCategorisedAddress(input)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Input '${input}' matches a category Address but no category is expected`,
                fatal: true,
              })
            }

            if (!isAddress(input))
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Input '${input}' is not a strict Address`,
                fatal: true,
              })
            return true
          })
          .refine((_address): _address is Address => true),
    (ts) => ts.factory.createIdentifier('Address'),
  )
}

export const categorisedAddress = <T extends string>(
  category: T,
  conform: boolean = false,
): ZodCategorisedAddress<T> => {
  return withGetType<ZodCategorisedAddress<T>>(
    conform
      ? z
          .string()
          .superRefine((input, ctx) => {
            const inputIsAddress = isAddress(input)
            const inputIsCategorisedAddress = isCategorisedAddress(input)

            if (!inputIsAddress && !inputIsCategorisedAddress)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Input '${input}' could not be conformed to a CategorisedAddress`,
                fatal: true,
              })
            return true
          })
          .transform((_address) => {
            const normalizedAddress = _address.includes(':')
              ? _address.split(':')[1]
              : _address
            return `${category}:${normalizedAddress}`
          })
          .refine((_address): _address is CategorisedAddress<T> => true)
      : z
          .string()
          .superRefine((input, ctx) => {
            const inputIsAddress = isAddress(input)
            const inputIsCategorisedAddress = isCategorisedAddress(input)
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
            return true
          })
          .refine((_address): _address is CategorisedAddress<T> => true),

    // .refine(
    //   (v): v is CategorisedAddress<T> =>
    //     isCategorisedAddress(v) && v.split(':')[0] === category,
    // ),
    (ts) => ts.factory.createIdentifier(categoryAddressType(category)),
  )
}
