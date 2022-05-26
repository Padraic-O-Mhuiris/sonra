import { validateEnvironment } from './environment/validateEnvironment'
import { AppConfig } from './config'
import { logger } from './utils'

export async function run({
  outDir,
  typechain,
  schema,
  contracts,
  fetch,
  config,
  silent,
  dryRun,
}: AppConfig) {
  await validateEnvironment(x)
  // validateEnvironment
  // validateConfiguration
  // generateCategoryDescriptions
  // generateCategoryFiles
}
