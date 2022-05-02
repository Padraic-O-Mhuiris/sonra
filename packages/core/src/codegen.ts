import fs from 'fs/promises'

import { SonraConfig } from './config'
import { createSonraSchema } from './schema'
import { SonraModel } from './types'

export async function run<M extends SonraModel>({
  model,
  fetch,
}: SonraConfig<M>) {
  const schema = createSonraSchema(model)
  const fetchResult = await fetch()
  const schemaResult = schema.safeParse(fetchResult)

  if (!schemaResult.success) {
    // eslint-disable-next-line
    console.log('Schema parse failed')

    // eslint-disable-next-line
    console.error(schemaResult.error)
    return
  }

  const data = schemaResult.data
  // eslint-disable-next-line
  console.error('Schema parse success')

  await fs.writeFile('./file.ts', JSON.stringify(data, null, 2))
  // eslint-disable-next-line
  console.log(JSON.stringify(data, null, 2))
  // validate category contract names
  // validate category address & metadata
}
