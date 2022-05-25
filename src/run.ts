import { validateEnvironment } from './environment/validateEnvironment'
import { SonraConfig, SonraSchema } from './types'

export interface AppConfig {
  config: SonraConfig<SonraSchema>
  configPath: string
  typechainDirPath: string
}

export async function run({ config, configPath }: AppConfig) {
  await validateEnvironment({ config, configPath })
  // validateEnvironment
  // validateConfiguration
  // generateCategoryDescriptions
  // generateCategoryFiles
}
