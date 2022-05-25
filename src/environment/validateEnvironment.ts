import { AppConfig } from '../run'
import { SonraConfig, SonraSchema } from '../types'

interface Environment {
  configPath: string
  workingDir: string
  typechainDirPath: string
}

export async function validateEnvironment({}: AppConfig): Environment {}
