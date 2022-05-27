import { z } from 'zod'
import { SonraCategorySchema, SonraDataModelSchema, SonraSchema } from './types'
import { zx } from './zodx'

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

export const isCategorySchemaValue = (v: any): v is SonraCategorySchema =>
  isNonEmptyAddressArraySchema(v) || isAddressSchema(v) || isZodObjectSchema(v)

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
