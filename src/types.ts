import { z } from 'zod'

import { AddressSchema } from './address'
import { ObjectKeysToTuple } from './utils'

export type TupleToZodTupleLiterals<T extends readonly [...any[]]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? [z.ZodLiteral<Head>, ...TupleToZodTupleLiterals<Tail>]
  : []

interface CategoryModel<ContractName extends string> {
  readonly contract: ContractName
  readonly meta: z.AnyZodObject
}

export type SonraModel = {
  readonly [k in string]: CategoryModel<string>
}

export type SonraSchema<Model extends SonraModel> = z.ZodObject<{
  categories: z.ZodTuple<TupleToZodTupleLiterals<ObjectKeysToTuple<Model>>>
  addresses: z.ZodObject<{
    [k in keyof Model & string]: z.ZodArray<AddressSchema>
  }>
  contracts: z.ZodObject<{
    [k in keyof Model & string]: z.ZodLiteral<Model[k]['contract']>
  }>
  metadata: z.ZodObject<{
    [k in keyof Model & string]: z.ZodRecord<AddressSchema, Model[k]['meta']>
  }>
}>

export type SonraDataModel<M extends SonraModel> = z.infer<SonraSchema<M>>
