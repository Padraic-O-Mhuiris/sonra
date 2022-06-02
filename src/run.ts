import { categoryFileDescriptions } from './codegen/categoryFileDescription'
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
  const { schema, typechainPath, contracts, outDir, fetch, dryRun } =
    normalizeAppConfig(appConfig)

  if (dryRun) {
    logger.info('Dry run, fetching and validating data model only')
    validateCategories(schema)
    await fetchDataModel({ schema, fetch })
    return
  }

  logger.info({ typechainPath, contracts }, 'Sonra started!')

  const [categories, categoryHierarchy] = validateCategories(schema)
  const typechainValidationResult = validateTypechain(typechainPath, contracts)

  console.log(categories)
  const categoryDirectoryPaths = await createCategoryDirs({
    categoryHierarchy,
    typechainValidationResult,
    typechainPath,
    outDir,
  })

  const dataModel = await fetchDataModel({ schema, fetch })

  const categoryDescriptions = categoryFileDescriptions(
    categories,
    categoryHierarchy,
    categoryDirectoryPaths,
    schema,
    dataModel,
  )

  logger.info(categoryDescriptions, 'Category Descriptions:')
  // generateCategoryDescriptions
  // generateCategoryFiles

  logger.info('Sonra finished!')
}
