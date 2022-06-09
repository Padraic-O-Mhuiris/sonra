import { z } from 'zod'
import { zx } from './zodx'

export type SonraCategorySchema =
  | z.AnyZodObject // arbitrary metadata which will be transformed into an address record
  | zx.ZodAddress // unique address, no metadata
  | z.ZodArray<zx.ZodAddress, 'atleastone'> // address list, no metadata

export type SonraSchema = {
  readonly [x: string]: SonraSchema | SonraCategorySchema
}

export type SonraDataModelSchemaValue<Value extends SonraCategorySchema> =
  Value extends z.AnyZodObject ? zx.ZodAddressRecord<Value> : Value

export type SonraDataModelSchemaValues =
  | zx.ZodAddressRecord
  | zx.ZodAddress
  | z.ZodArray<zx.ZodAddress, 'atleastone'>

export type SonraDataModelSchema<T extends SonraSchema> = z.ZodObject<
  {
    [K in keyof T]:
      | (T[K] extends SonraSchema ? SonraDataModelSchema<T[K]> : never)
      | (T[K] extends SonraCategorySchema
          ? SonraDataModelSchemaValue<T[K]>
          : never)
  },
  'strict'
>

export type SonraDataModel<Schema extends SonraSchema> = z.infer<
  SonraDataModelSchema<Schema>
>

export type SonraFetch<Schema extends SonraSchema> = () => Promise<
  SonraDataModel<Schema>
>

type SonraSchemaKeyTree<T extends SonraSchema> = {
  [P in keyof T]-?: T[P] extends SonraCategorySchema
    ? [P]
    : [P] | [P, ...(T[P] extends SonraSchema ? SonraSchemaKeyPaths<T[P]> : [])]
}

type SonraSchemaKeyPaths<T extends SonraSchema> =
  SonraSchemaKeyTree<T>[keyof SonraSchemaKeyTree<T>]

export type SonraSchemaKeys<T> = T extends SonraSchema
  ? SonraSchemaKeyPaths<T>[number]
  : never

export type SonraContracts<T extends SonraSchema> = Partial<
  Record<SonraSchemaKeys<T>, string>
>
