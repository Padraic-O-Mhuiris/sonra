import { AppConfig } from '../run'
import { SonraConfig, SonraSchema } from '../types2'

interface Environment {
  configPath: string
  workingDir: string
  typechainDirPath: string
}

export async function validateEnvironment({}: AppConfig): Environment {}
