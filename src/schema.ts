import { keys } from 'lodash'
import { z } from 'zod'
import { zx } from './zodx'
import { isUniqueArray, log } from './utils'

export type SonraModel = {
  readonly [k in string]: z.AnyZodObject
}

export type SonraSchema<Model extends SonraModel> = z.ZodObject<{
  addresses: z.ZodObject<{
    [k in keyof Model & string]: z.ZodArray<zx.ZodAddress<''>, 'atleastone'>
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

export type SonraMetadata<
  M extends SonraModel,
  T extends keyof M & string,
  U extends
    | keyof SonraDataModel<M>['metadata'][T][zx.Address]
    | undefined = undefined,
> = U extends keyof SonraDataModel<M>['metadata'][T][zx.Address]
  ? SonraDataModel<M>['metadata'][T][zx.Address][U]
  : SonraDataModel<M>['metadata'][T]

export const createSonraSchema = <Model extends SonraModel>(
  model: Model,
): SonraSchema<Model> => {
  const modelKeys = keys(model)

  const addresses = z.object(
    modelKeys.reduce(
      (acc, arg) => ({
        ...acc,
        [arg]: zx
          .address()
          .array()
          .nonempty()
          .refine(isUniqueArray, (arg) => ({
            message: `Address array must be unique - input: ${JSON.stringify(
              arg,
            )}`,
          })),
      }),
      {} as {
        [k in keyof Model & string]: z.ZodArray<zx.ZodAddress<''>, 'atleastone'>
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

export const fetchAndValidate = async (
  model: SonraModel,
  fetch: SonraFetch<SonraModel>,
): Promise<SonraDataModel<SonraModel>> => {
  log('Creating schema and validating fetch result')
  const schema = createSonraSchema<SonraModel>(model)
  const fetchResult = await fetch()

  const schemaResult = schema.safeParse(fetchResult)

  if (!schemaResult.success) {
    log('Fetch result failed validation by schema:')
    throw new Error(schemaResult.error.toString())
  }

  log('Schema parse success')
  return schemaResult.data
}
