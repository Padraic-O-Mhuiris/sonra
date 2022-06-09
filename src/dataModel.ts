import { SonraDataModel, SonraFetch, SonraSchema } from './types'
import { genDataModelSchema } from './schema'

export async function fetchDataModel<T extends SonraSchema>({
  schema,
  fetch,
}: {
  schema: T
  fetch: SonraFetch<T>
}): Promise<SonraDataModel<T>> {
  const dataModelSchema = genDataModelSchema(schema)

  const fetchResult = await fetch()

  const dataModelValidation = dataModelSchema.safeParse(fetchResult)
  if (dataModelValidation.success) {
    return dataModelValidation.data
  } else {
    throw new Error(dataModelValidation.error.message)
  }
}
