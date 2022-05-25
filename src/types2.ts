import { Dictionary } from 'ts-essentials'
import { z } from 'zod'
import { NestedPaths } from './utils'
import { zx } from './zodx'

type SonraCategorySchema =
  | z.AnyZodObject // arbitrary metadata which will be transformed into an address record
  | zx.ZodAddress // unique address, no metadata
  | z.ZodArray<zx.ZodAddress, 'atleastone'> // address list, no metadata

export type SonraSchema = {
  readonly [k in string]: SonraSchema | SonraCategorySchema
}

export type SonraDataModelSchemaValue<Value extends SonraCategorySchema> =
  Value extends z.AnyZodObject ? zx.ZodAddressRecord<Value> : Value

export type SonraDataModelSchema<T extends SonraSchema> = z.ZodObject<
  {
    [K in keyof T]: T[K] extends SonraCategorySchema
      ? SonraDataModelSchemaValue<T[K]>
      : T[K] extends SonraSchema
      ? SonraDataModelSchema<T[K]>
      : never
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

export type SonraContracts<T extends SonraSchema> = Record<
  SonraSchemaKeys<T>,
  `${string}.sol`
>

export type SonraConfig<Schema extends SonraSchema> = {
  /**
   * Output directory for all files relative to process.cwd()
   * */
  dir: string
  /**
   * Sonra model which is used to validate the SonraDataModel
   * */
  schema: Schema
  /**
   * List of contracts which must associated to a declared category
   * */
  contracts: SonraContracts<Schema>
  /**
   * Async function which returns a list of addresses, contracts and metadata
   * corresponding to the input model and each keyed by a specific "category"
   * */
  fetch: SonraFetch<Schema>
}
