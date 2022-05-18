import { ethers } from 'ethers'
import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
  ParseStatus,
  ZodIssueCode,
  ZodParsedType,
  ZodType,
  ZodTypeDef,
} from 'zod'

import { withGetType } from 'zod-to-ts'
import { categoryAddressType } from '../codegen/utils'

export type Address = string & {
  readonly __brand: 'Address'
}

const isAddress = (val: string): val is Address => ethers.utils.isAddress(val)

interface ZodAddressDef extends ZodTypeDef {
  typeName: 'ZodAddress'
  conform?: boolean
}

export class ZodAddress extends ZodType<Address, ZodAddressDef, string> {
  _parse(input: ParseInput): ParseReturnType<Address> {
    const parsedType = this._getType(input)

    if (parsedType !== ZodParsedType.string) {
      const ctx = this._getOrReturnCtx(input)
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx.parsedType,
      })
      return INVALID
    }

    const inputIsAddress = isAddress(input.data)
    const inputIsCategorisedAddress = isCategorisedAddress(input.data)
    if (this._def.conform) {
      if (!inputIsAddress && !inputIsCategorisedAddress) {
        const ctx = this._getOrReturnCtx(input)
        addIssueToContext(ctx, {
          code: ZodIssueCode.custom,
          expected: 'Address',
          received: ctx.parsedType,
          message: `Input ${input.data} could not be conformed to an Address`,
        })
        return INVALID
      }

      // if conform is set true we accept categorised addresses as valid and
      // conform them to addresses
      if (inputIsCategorisedAddress) {
        input.data = (input.data as CategorisedAddress<string>).split(':')[1]
      }
    } else {
      if (inputIsCategorisedAddress) {
        const ctx = this._getOrReturnCtx(input)
        addIssueToContext(ctx, {
          code: ZodIssueCode.custom,
          expected: 'Address',
          received: ctx.parsedType,
          message: `Input '${input.data}' indicates a CategoryAddress<${
            input.data.split(':')[0]
          }> but no category is expected`,
        })
        return INVALID
      }

      if (!inputIsAddress) {
        const ctx = this._getOrReturnCtx(input)
        addIssueToContext(ctx, {
          code: ZodIssueCode.custom,
          expected: 'Address',
          received: ctx.parsedType,
          message: `Input ${input.data} is not a valid Address`,
        })
        return INVALID
      }
    }

    const status = new ParseStatus()
    return { status: status.value, value: input.data }
  }

  category<T extends string>(category: T) {
    return withGetType<ZodCategorisedAddress<T>>(
      new ZodCategorisedAddress({
        ...this._def,
        typeName: 'ZodCategorisedAddress',
        category,
      }),

      (ts) => ts.factory.createIdentifier(categoryAddressType(category)),
    )
  }

  conform() {
    return new ZodAddress({ ...this._def, conform: true })
  }

  static create = (): ZodAddress => {
    return new ZodAddress({
      typeName: 'ZodAddress',
    })
  }
}

export type CategorisedAddress<T extends string> = Address & {
  readonly __category: T
}

const isCategorisedAddress = (val: string): val is CategorisedAddress<string> =>
  val.includes(':') &&
  val.split(':')[0].length !== 0 &&
  isAddress(val.split(':')[1]) &&
  val.split(':').length === 2

interface ZodCategorisedAddressDef<T extends string> extends ZodTypeDef {
  typeName: 'ZodCategorisedAddress'
  category: T
  conform?: boolean
}

export class ZodCategorisedAddress<T extends string> extends ZodType<
  CategorisedAddress<T>,
  ZodCategorisedAddressDef<T>,
  string
> {
  _parse(input: ParseInput): ParseReturnType<CategorisedAddress<T>> {
    const parsedType = this._getType(input)

    const category = this._def.category

    if (parsedType !== ZodParsedType.string) {
      const ctx = this._getOrReturnCtx(input)
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx.parsedType,
      })
      return INVALID
    }

    const inputIsAddress = isAddress(input.data)
    const inputIsCategorisedAddress = isCategorisedAddress(input.data)
    if (this._def.conform) {
      if (!inputIsAddress && !inputIsCategorisedAddress) {
        const ctx = this._getOrReturnCtx(input)
        addIssueToContext(ctx, {
          code: ZodIssueCode.custom,
          expected: `CategorisedAddress<${category}>`,
          received: ctx.parsedType,
          message: `Input '${input.data}' could not be conformed to CategorisedAddress<${category}>`,
        })
        return INVALID
      }

      input.data as CategorisedAddress<T> | Address
      const normalizedAddress = input.data.includes(':')
        ? input.data.split(':')[1]
        : input.data
      input.data = `${category}:${normalizedAddress}`
    } else {
      if (!inputIsCategorisedAddress) {
        const ctx = this._getOrReturnCtx(input)
        addIssueToContext(ctx, {
          code: ZodIssueCode.custom,
          expected: `CategorisedAddress<${category}>`,
          received: ctx.parsedType,
          message: `Input ${input.data} is not a valid CategorisedAddress<${category}>`,
        })
        return INVALID
      }

      if (category !== (input.data as CategorisedAddress<T>).split(':')[0]) {
        const ctx = this._getOrReturnCtx(input)
        addIssueToContext(ctx, {
          code: ZodIssueCode.custom,
          expected: `CategorisedAddress<${category}>`,
          received: ctx.parsedType,
          message: `Input '${input}' does not match this addresses category: ${category}`,
        })

        return INVALID
      }
    }

    const status = new ParseStatus()
    return { status: status.value, value: input.data as CategorisedAddress<T> }
  }

  conform() {
    return new ZodCategorisedAddress({ ...this._def, conform: true })
  }
}

export const address = () =>
  withGetType<ZodAddress>(ZodAddress.create(), (ts) =>
    ts.factory.createIdentifier('Address'),
  )
