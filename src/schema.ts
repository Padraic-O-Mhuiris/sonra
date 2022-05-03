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
        [arg]: z.literal(model[arg].contract),
      }),
      {} as {
        [k in keyof Model & string]: z.ZodLiteral<Model[k]['contract']>
      },
    ),
  )

  const metadata = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: z.record(addressSchema, model[arg].meta),
      }),
      {} as {
        [k in keyof Model & string]: z.ZodRecord<
          AddressSchema,
          Model[k]['meta']
        >
      },
    ),
  )

  return z.object({
    addresses,
    contracts,
    metadata,
  })
}
