import { logger } from './utils'
import { SonraDataModel, SonraFetch, SonraSchema } from './types'
import { genDataModelSchema } from './schema'

export async function fetchDataModel<T extends SonraSchema>({
  schema,
  fetch,
}: {
  schema: T
  fetch: SonraFetch<T>
}): Promise<SonraDataModel<T>> {
  logger.info('Creating sonra data model')
  const dataModelSchema = genDataModelSchema(schema)

  logger.info('Fetching data...')
  const fetchResult = await fetch()
  logger.info('Fetched data')

  const dataModelValidation = dataModelSchema.safeParse(fetchResult)
  if (dataModelValidation.success) {
    logger.info(dataModelValidation.data, 'Created data model:')

    return dataModelValidation.data
  } else {
    throw new Error(dataModelValidation.error.message)
  }
}
