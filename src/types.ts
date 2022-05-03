import { z } from 'zod'
import { AddressSchema } from './address'

export type SonraModel = {
  readonly [k in string]: z.AnyZodObject
}

export type SonraSchema<Model extends SonraModel> = z.ZodObject<{
  addresses: z.ZodObject<{
    [k in keyof Model & string]: z.ZodArray<AddressSchema>
  }>
  contracts: z.ZodObject<{
    [k in keyof Model & string]: z.ZodString
  }>
  metadata: z.ZodObject<{
    [k in keyof Model & string]: z.ZodRecord<AddressSchema, Model[k]>
  }>
}>

export type SonraDataModel<M extends SonraModel> = z.infer<SonraSchema<M>>

export type SonraFetch<M extends SonraModel> = () => Promise<SonraDataModel<M>>
