import { codegen } from './codegen'
import { AppConfig } from './config'
import { fetchDataModel } from './dataModel'
import { createCategoryDirs } from './dir'
import { normalizeAbsPath } from './utils'
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
    validateCategories(schema)
    await fetchDataModel({ schema, fetch })
    return
  }

  const [categories, categoryHierarchy] = validateCategories(schema)
  const categoryContractInfo = validateTypechain(typechainPath, contracts)

  const categoryDirectoryPaths = await createCategoryDirs({
    categoryHierarchy,
    categoryContractInfo,
    typechainPath,
    outDir,
  })

  const dataModel = await fetchDataModel({ schema, fetch })

  await codegen(
    categories,
    categoryHierarchy,
    categoryDirectoryPaths,
    schema,
    dataModel,
    categoryContractInfo,
    outDir,
  )

  // generateCategoryDescriptions
  // generateCategoryFiles
}
