import { validateEnvironment } from './environment/validateEnvironment'
import { AppConfig } from './config'
import { logger } from './utils'

export async function run(x: AppConfig) {
  await validateEnvironment(x)
  // validateEnvironment
  // validateConfiguration
  // generateCategoryDescriptions
  // generateCategoryFiles
}
