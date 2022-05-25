import { z } from 'zod'
import { zx } from './zodx'
import {
  SonraContracts,
  SonraDataModelSchema,
  SonraSchema,
  SonraSchemaCategoryKeys,
  SonraSchemaKeys,
} from './types2'

const schema = {
  DAI: z.object({}),
  USDC: z.object({}),
  principalToken: z.object({}),
  AAA: {
    BBB: z.object({}),
    CCC: {
      DDD: z.object({
        aaa: z.literal('1'),
      }),
    },
  },
  YYY: {
    UUU: zx.address(),
    ZZZ: {
      XXX: z.object({}),
    },
  },
} as const

type UserSchema = typeof schema

type XXX = SonraContracts<UserSchema>

const x: XXX = {
  DAI: 'sss',
  USDC: 'sss',
  principalToken: 'sss',
  AAA: 'sss',
  BBB: 'sss',
  CCC: 'sss',
  DDD: 'sss',
  YYY: 'sss',
  UUU: 'sss',
  ZZZ: 'sss',
  XXX: 'sss',
}

function isZodObjectSchema(v: any): v is z.AnyZodObject {
  return v?._def?.typeName === z.ZodFirstPartyTypeKind.ZodObject
}

function isAddressSchema(v: any): v is zx.ZodAddress {
  return v?._def?.typeName === 'ZodAddress'
}

function isNonEmptyAddressArraySchema(
  v: any,
): v is z.ZodArray<zx.ZodAddress, 'atleastone'> {
  return (
    v?._def?.typeName === z.ZodFirstPartyTypeKind.ZodArray &&
    v?._def?.minLength?.value === 1 &&
    isAddressSchema(v?._def?.type)
  )
}

export function genDataModelSchema<Schema extends SonraSchema>(
  schema: Schema,
): SonraDataModelSchema<Schema> {
  return z
    .object(
      Object.keys(schema).reduce((acc, category) => {
        const schemaValue = schema[category]
        return {
          ...acc,
          [category]: isZodObjectSchema(schemaValue)
            ? zx.address().record(schemaValue)
            : isAddressSchema(schemaValue) ||
              isNonEmptyAddressArraySchema(schemaValue)
            ? schemaValue
            : genDataModelSchema(schemaValue),
        }
      }, {} as SonraDataModelSchema<Schema>['_shape']),
    )
    .strict()
}
