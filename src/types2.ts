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

// Recursively descends nested object and selects all values with keys
export type SonraSchemaKeys<T> = T extends object
  ? T extends SonraCategorySchema
    ? never
    : keyof T | SonraSchemaKeys<T[keyof T]>
  : never

export type SonraSchemaCategoryKeys<T> = T extends object
  ? T extends SonraCategorySchema
    ? never
    :
        | {
            [K in keyof T]: T[K] extends SonraCategorySchema ? K : never
          }[keyof T]
        | SonraSchemaCategoryKeys<T[keyof T]>
  : never

export type SonraSchemaRootKeys<T> = T extends object
  ? T extends SonraCategorySchema
    ? never
    :
        | {
            [K in keyof T]: T[K] extends SonraCategorySchema ? never : K
          }[keyof T]
        | SonraSchemaRootKeys<T[keyof T]>
  : never

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

// export type SonraContracts<Schema extends SonraSchema> = Dictionary<
//   string,
//   SonraSchemaKeys<Schema>
// > // {
// //   [K: NestedPaths<Schema>]: string
// // }

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
   * Async function which returns a list of addresses, contracts and metadata
   * corresponding to the input model and each keyed by a specific "category"
   * */
  fetch: SonraFetch<Schema>
}
