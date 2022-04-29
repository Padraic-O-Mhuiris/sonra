import { keys } from 'lodash'
import { z } from 'zod'

import {
  createTaggedAddressSchema,
  TagAddress,
  TaggedAddressSchema,
} from './address'

type ZodTupleLiterals<T extends readonly [...any[]]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? [z.ZodLiteral<Head>, ...ZodTupleLiterals<Tail>]
  : []

type ContractModel<C extends string> = {
  [k in string]: [C, z.AnyZodObject]
}

export type IModel = ContractModel<string>

type UnionToIntersection<U> = (
  U extends never ? never : (arg: U) => never
) extends (arg: infer I) => void
  ? I
  : never

// Possibly dangerous
// https://stackoverflow.com/questions/55127004/how-to-transform-union-type-to-tuple-type
// https://github.com/microsoft/TypeScript/issues/13298
type UnionToTuple<T> = UnionToIntersection<
  T extends never ? never : (t: T) => T
> extends (_: never) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : []

type ObjectKeysToTuple<T> = T extends Record<string, any>
  ? UnionToTuple<keyof T>
  : never

type CategoriesSchema<Model extends IModel> = z.ZodTuple<
  ZodTupleLiterals<ObjectKeysToTuple<Model>>
>

type AddressesSchema<Model extends IModel> = z.ZodObject<{
  [k in ObjectKeysToTuple<Model>[number]]: z.ZodArray<TaggedAddressSchema<k>>
}>

type ContractsSchema<Model extends IModel> = z.ZodObject<{
  [k in ObjectKeysToTuple<Model>[number]]: z.ZodLiteral<Model[k][0]>
}>

type MetadataSchema<Model extends IModel> = z.ZodObject<{
  [k in ObjectKeysToTuple<Model>[number]]: z.ZodObject<{
    [r in TagAddress<k>]: Model[k][1]
  }>
}>

export type Schema<Model extends IModel> = z.ZodObject<{
  categories: CategoriesSchema<Model>
  addresses: AddressesSchema<Model>
  contracts: ContractsSchema<Model>
  metadata: MetadataSchema<Model>
}>

export type InferredSchema<S extends Schema<IModel>> = z.infer<S>

export type ModelResult<M extends IModel> = Schema<M> extends Schema<IModel>
  ? InferredSchema<Schema<M>>
  : never

export const createSchema = <Model extends IModel>(
  model: Model,
): Schema<Model> => {
  const modelKeys = keys(model) as unknown as ObjectKeysToTuple<Model>

  const categoriesTuple = z.tuple(
    modelKeys.map((k) => z.literal(k)) as ZodTupleLiterals<
      ObjectKeysToTuple<Model>
    >,
  )

  const addresses = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: createTaggedAddressSchema(arg).array(),
      }),
      {} as {
        [k in ObjectKeysToTuple<Model>[number]]: z.ZodArray<
          TaggedAddressSchema<k>
        >
      },
    ),
  )

  const contracts = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: z.literal(model[arg][0]),
      }),
      {} as {
        [k in ObjectKeysToTuple<Model>[number]]: z.ZodLiteral<Model[k][0]>
      },
    ),
  )

  const metadata = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: z.record(createTaggedAddressSchema(arg), model[arg][1]), // change outcome type to partial
      }),
      {} as {
        [k in ObjectKeysToTuple<Model>[number]]: z.ZodObject<{
          [r in TagAddress<k>]: typeof model[k][1]
        }>
      },
    ),
  )

  return z.object({
    categories: categoriesTuple,
    addresses,
    contracts,
    metadata,
  })
}
