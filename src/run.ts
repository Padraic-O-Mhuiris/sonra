import { AppConfig } from './config'
import { fetchDataModel } from './dataModel'
import { createCategoryDirs } from './dir'
import { logger, normalizeAbsPath } from './utils'
import { validateCategories } from './validations/validateCategories'
import { validateTypechain } from './validations/validateTypechain'

const normalizeAppConfig = ({
  configPath,
  typechainPath,
  outDir,
  ...rest
}: AppConfig): AppConfig => ({
  configPath: normalizeAbsPath(configPath),
  typechainPath: normalizeAbsPath(typechainPath),
  outDir: normalizeAbsPath(outDir),
  ...rest,
})

export async function run(appConfig: AppConfig) {
  const { schema, typechainPath, contracts, outDir, fetch } =
    normalizeAppConfig(appConfig)

  logger.info({ typechainPath, contracts }, 'Sonra started!')

  const [categories, categoryHierarchy] = validateCategories(schema)

  const typechainValidationResult = validateTypechain(typechainPath, contracts)

  const categoryDirectoryPaths = await createCategoryDirs({
    categoryHierarchy,
    typechainValidationResult,
    typechainPath,
    outDir,
  })

  const dataModel = await fetchDataModel({ schema, fetch })

  // TODO build category descriptions array
  // TODO output to files
  //
  //
  //
  // validateEnvironment
  // validateConfiguration
  // generateCategoryDescriptions
  // generateCategoryFiles

  logger.info('Sonra finished!')
}
