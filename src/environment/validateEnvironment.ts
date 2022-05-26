import { AppConfig } from '../config'

interface Environment {
  configPath: string
  workingDir: string
  typechainDirPath: string
}

export async function validateEnvironment(x: AppConfig): Promise<Environment> {
  return { configPath: '', workingDir: '', typechainDirPath: '' }
}
