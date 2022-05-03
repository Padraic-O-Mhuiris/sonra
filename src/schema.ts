import { keys } from 'lodash'
import { z } from 'zod'
import { addressArraySchema, addressSchema, AddressSchema } from './address'
import { SonraModel, SonraSchema } from './types'

export const createSonraSchema = <Model extends SonraModel>(
  model: Model,
): SonraSchema<Model> => {
  const modelKeys = keys(model)

  const addresses = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: addressArraySchema,
      }),
      {} as {
        [k in keyof Model & string]: z.ZodArray<AddressSchema>
      },
    ),
  )

  const contracts = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: z.string,
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
        [arg]: z.record(addressSchema, model[arg]),
      }),
      {} as {
        [k in keyof Model & string]: z.ZodRecord<AddressSchema, Model[k]>
      },
    ),
  )

  return z.object({
    addresses,
    contracts,
    metadata,
  })
}
