import { AppConfig } from './config'
import { fetchDataModel } from './dataModel'
import { createCategoryDirs } from './dir'
import { SonraSchema } from './types'
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

export async function run<T extends SonraSchema>(appConfig: AppConfig) {
  const { schema, typechainPath, contracts, outDir, fetch, dryRun } =
    normalizeAppConfig(appConfig)

  if (dryRun) {
    logger.info('Dry run, fetching and validating data model only')
    validateCategories(schema)
    const dataModelDryRun = await fetchDataModel({ schema, fetch })
    return
  }

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

  // generateCategoryDescriptions
  // generateCategoryFiles

  logger.info('Sonra finished!')
}
