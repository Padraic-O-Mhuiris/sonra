import { BigNumber } from 'ethers'
import {
  addIssueToContext,
  INVALID,
  OK,
  ParseInput,
  ParseReturnType,
  ZodIssueCode,
  ZodType,
  ZodTypeDef,
} from 'zod'
import { withGetType } from 'zod-to-ts'

export interface ZodBigNumberDef extends ZodTypeDef {
  typeName: 'ZodBigNumber'
}

export class ZodBigNumber extends ZodType<BigNumber, ZodBigNumberDef> {
  _parse(input: ParseInput): ParseReturnType<BigNumber> {
    if (!BigNumber.isBigNumber(input.data)) {
      const ctx = this._getOrReturnCtx(input)
      addIssueToContext(ctx, {
        code: ZodIssueCode.custom,
        expected: 'BigNumber',
        received: ctx.parsedType,
      })
      return INVALID
    }
    return OK(input.data)
  }

  static create = (): ZodBigNumber =>
    new ZodBigNumber({
      typeName: 'ZodBigNumber',
    })
}

export const bignumber = () =>
  withGetType<ZodBigNumber>(ZodBigNumber.create(), (ts) =>
    ts.factory.createIdentifier('BigNumber'),
  )
