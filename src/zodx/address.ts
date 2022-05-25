import { ethers } from 'ethers'
import {
  addIssueToContext,
  INVALID,
  ParseInput,
  ParseReturnType,
  ParseStatus,
  z,
  ZodIssueCode,
  ZodParsedType,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
} from 'zod'
import { withGetType } from 'zod-to-ts'
import { capitalize } from '../utils'

declare const __address__: unique symbol

export type __Address__ = {
  readonly [__address__]: void
}

export type Address = string & __Address__

type ZodXTypeAny = ZodTypeAny | ZodAddress

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

      (ts) => ts.factory.createIdentifier(`${capitalize(category)}Address`),
    )
  }

  conform() {
    return new ZodAddress({ ...this._def, conform: true })
  }

  record<V extends ZodXTypeAny>(valueType: V): ZodAddressRecord<V> {
    return new ZodAddressRecord({ valueType, typeName: 'ZodAddressRecord' })
  }

  static create = (): ZodAddress =>
    new ZodAddress({
      typeName: 'ZodAddress',
    })
}

declare const __category__: unique symbol

export type __Category__<T extends string> = {
  readonly [__category__]: T
}

export type CategorisedAddress<T extends string> = Address & __Category__<T>

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

export type AddressRecord<V> = {
  [k in Address]: V
}

interface ZodAddressRecordDef<Value extends ZodXTypeAny = ZodXTypeAny>
  extends ZodTypeDef {
  typeName: 'ZodAddressRecord'
  valueType: Value
}

export class ZodAddressRecord<
  Value extends ZodXTypeAny = ZodXTypeAny,
> extends ZodType<
  Record<Address, Value['_output']>,
  ZodAddressRecordDef<Value>,
  Record<Address, Value['_output']>
> {
  _parse(input: ParseInput): ParseReturnType<this['_output']> {
    const ctx = this._getOrReturnCtx(input)
    const result = z
      .record(z.string(), this._def.valueType)
      .safeParse(input.data)
    if (!result.success) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.custom,
        expected: `AddressRecord`,
        message: result.error.message + ' - not a valid AddressRecord',
      })
      return INVALID
    }

    if (!Object.keys(input.data).every(isAddress)) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.custom,
        expected: `AddressRecord`,
        message: `Keys in record must be all valid addresses`,
      })
      return INVALID
    }

    const status = new ParseStatus()
    return {
      status: status.value,
      value: input.data as AddressRecord<Value['_output']>,
    }
  }
}

export const address = () =>
  withGetType<ZodAddress>(ZodAddress.create(), (ts) =>
    ts.factory.createIdentifier('Address'),
  )
