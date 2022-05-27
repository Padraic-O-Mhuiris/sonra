import { AppConfig } from './config'
import { logger } from './utils'
import { validateCategories } from './validations/validateCategories'
import { validateTypechain } from './validations/validateTypechain'

export async function run({ typechainPath, contracts, schema }: AppConfig) {
  logger.info({ typechainPath, contracts }, 'Sonra started!')

  const [categories, categoryHierarchy] = validateCategories(schema)

  const typechainValidationResult = validateTypechain(typechainPath, contracts)

  console.log(categoryHierarchy)

  // TODO Build category filepaths obj keyed by each individual category + whether it is a parent or child category
  // TODO rm -rf previous directory at outDir
  // TODO Build directory structure hierarchy and copy typechain directory under <outdir>/contracts
  //
  // TODO build category descriptions array
  // TODO out put to files
  //
  //
  // validateEnvironment
  // validateConfiguration
  // generateCategoryDescriptions
  // generateCategoryFiles

  logger.info('Sonra finished!')
}
