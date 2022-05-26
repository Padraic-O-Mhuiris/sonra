import { validateEnvironment } from './environment/validateEnvironment'
import { AppConfig } from './config'

export async function run(x: AppConfig) {
  await validateEnvironment(x)
  // validateEnvironment
  // validateConfiguration
  // generateCategoryDescriptions
  // generateCategoryFiles
}
