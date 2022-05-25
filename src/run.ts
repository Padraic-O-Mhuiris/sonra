import { validateEnvironment } from './environment/validateEnvironment'
import { SonraConfig, SonraSchema } from './types2'

export interface AppConfig {
  config: SonraConfig<SonraSchema>
  configPath: string
}

export async function run(
  config: SonraConfig<SonraSchema>,
  configPath: string,
) {
  await validateEnvironment(config, configPath)
  // validateEnvironment
  // validateConfiguration
  // generateCategoryDescriptions
  // generateCategoryFiles
}
