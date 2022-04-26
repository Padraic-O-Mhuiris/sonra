import { Provider } from '@ethersproject/abstract-provider'

import { IModel, InferredSchema, Schema } from './schema'

export async function generate<S extends Schema<IModel>>(
  provider: Provider,
  schema: S,
  fetch: (provider: Provider) => Promise<InferredSchema<S>>,
) {
  const fetchResult = await fetch(provider)
  const schemaResult = schema.safeParse(fetchResult)
  if (schemaResult.success) {
    // eslint-disable-next-line
    console.log('Schema parsed successfully')
    // eslint-disable-next-line
    console.log(schemaResult.data)
  } else {
    // eslint-disable-next-line
    console.log('Schema parse failed')
  }
}
