import { zx } from './zodx'
import { z } from 'zod'

export type SonraModel = {
  readonly [k in string]: z.AnyZodObject
}

export type SonraSchema<Model extends SonraModel> = z.ZodObject<{
  addresses: z.ZodObject<{
    [k in keyof Model & string]: z.ZodArray<zx.ZodAddress, 'atleastone'>
  }>
  contracts: z.ZodObject<{
    [k in keyof Model & string]: z.ZodString
  }>
  metadata: z.ZodObject<{
    [k in keyof Model & string]: zx.ZodAddressRecord<Model[k]>
  }>
}>

export type SonraDataModel<M extends SonraModel> = z.infer<SonraSchema<M>>

export type SonraFetch<M extends SonraModel> = () => Promise<SonraDataModel<M>>

export interface SonraCategoryModel<
  M extends SonraModel,
  Category extends keyof M & string,
> {
  addresses: [zx.Address, ...zx.Address[]]
  metadata: SonraDataModel<M>['metadata'][Category]
}

export type SonraCategoryMetadata<
  M extends SonraModel,
  Category extends keyof M & string,
> = SonraDataModel<M>['metadata'][Category][zx.Address]

export type SonraConfig<M extends SonraModel> = {
  /**
   * Output directory for all files relative to process.cwd()
   * */
  dir: string
  /**
   * Sonra model which is used to validate the SonraDataModel
   * */
  model: M
  /**
   * Async function which returns a list of addresses, contracts and metadata
   * corresponding to the input model and each keyed by a specific "category"
   * */
  fetch: SonraFetch<M>
}
