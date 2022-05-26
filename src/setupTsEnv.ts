import { loadConfig, register } from 'tsconfig-paths'

export function setupTsEnv(tsConfigPath: string) {
  try {
    require.resolve('typescript')
  } catch {
    throw new Error('Could not resolve typescript')
  }

  try {
    require.resolve('ts-node')
  } catch {
    throw new Error('Could not resolve ts-node')
  }

  try {
    require.resolve('tsconfig-paths')
  } catch {
    throw new Error('Could not resolve ts-node')
  }

  const tsConfig = loadConfig(tsConfigPath)

  if (tsConfig.resultType === 'success') {
    register({
      baseUrl: tsConfig.absoluteBaseUrl,
      paths: tsConfig.paths,
    })
  } else {
    throw new Error(tsConfig.message)
  }
}
