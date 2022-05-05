import { keys } from 'lodash'
import { z } from 'zod'
import * as zx from './zod'

export type SonraModel = {
  readonly [k in string]: z.AnyZodObject
}

export type SonraSchema<Model extends SonraModel> = z.ZodObject<{
  addresses: z.ZodObject<{
    [k in keyof Model & string]: z.ZodArray<zx.ZodAddress>
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

export const createSonraSchema = <Model extends SonraModel>(
  model: Model,
): SonraSchema<Model> => {
  const modelKeys = keys(model)

  const addresses = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: zx.address().array(),
      }),
      {} as {
        [k in keyof Model & string]: z.ZodArray<zx.ZodAddress>
      },
    ),
  )

  const contracts = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: z.string(),
      }),
      {} as {
        [k in keyof Model & string]: z.ZodString
      },
    ),
  )

  const metadata = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: zx.addressRecord(model[arg]),
      }),
      {} as {
        [k in keyof Model & string]: zx.ZodAddressRecord<Model[k]>
      },
    ),
  )

  return z.object({
    addresses,
    contracts,
    metadata,
  })
}
