import { z } from 'zod'

import { zx } from './zodx'

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
    UUU: z.object({}),
    ZZZ: {
      XXX: z.object({}),
    },
  },
} as const

type UserSchema = typeof schema

type SonraSchemaLeafValue = z.AnyZodObject

export type SonraSchema = {
  readonly [k in string]: SonraSchema | SonraSchemaLeafValue
}

// Recursively descends nested object and selects all values with keys
type SonraSchemaKeys<T> = T extends object
  ? T extends SonraSchemaLeafValue
    ? never
    : keyof T | SonraSchemaKeys<T[keyof T]>
  : never

export type testSonraSchemaKeys = SonraSchemaKeys<UserSchema>

type SonraSchemaLeafKeys<T> = T extends object
  ? T extends SonraSchemaLeafValue
    ? never
    :
        | {
            [K in keyof T]: T[K] extends SonraSchemaLeafValue ? K : never
          }[keyof T]
        | SonraSchemaLeafKeys<T[keyof T]>
  : never

export type testSonraSchemaLeafKeys = SonraSchemaLeafKeys<UserSchema>

type SonraSchemaRootKeys<T> = T extends object
  ? T extends SonraSchemaLeafValue
    ? never
    :
        | {
            [K in keyof T]: T[K] extends SonraSchemaLeafValue ? never : K
          }[keyof T]
        | SonraSchemaRootKeys<T[keyof T]>
  : never

export type testSonraSchemaRootKeys = SonraSchemaRootKeys<UserSchema>

export type DataModelSchemaLeafValue<Value extends SonraSchemaLeafValue> =
  zx.ZodAddressRecord<Value>

type SonraDataModelSchema<T extends SonraSchema> =
  T extends SonraSchemaLeafValue
    ? never
    : z.ZodObject<{
        [K in keyof T]: T[K] extends SonraSchemaLeafValue
          ? DataModelSchemaLeafValue<T[K]>
          : T[K] extends SonraSchema
          ? SonraDataModelSchema<T[K]>
          : never
      }>

export type testSonraDataModelSchema = SonraDataModelSchema<UserSchema>
export type testSonraDataModelSchema2 = z.infer<
  SonraDataModelSchema<UserSchema>
>['AAA']
