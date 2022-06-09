import { CategoryHierarchy } from './validations/validateCategories'
import { CategoryContractInfo } from './validations/validateTypechain'
import rimraf from 'rimraf'
import fs from 'fs'
import fse from 'fs-extra'
import { logger } from './utils'
import mkdirp from 'mkdirp'
import path from 'path'

export type CategoryDirectoryPaths = Record<string, string>

export async function createCategoryDirs({
  categoryHierarchy,
  categoryContractInfo,
  typechainPath,
  outDir,
}: {
  categoryHierarchy: CategoryHierarchy
  categoryContractInfo: CategoryContractInfo
  typechainPath: string
  outDir: string
}): Promise<CategoryDirectoryPaths> {
  if (fs.existsSync(outDir)) {
    logger.info(`Output directory '${outDir}' already exists, deleting...`)

    if (outDir === process.cwd()) {
      throw new Error('Cannot delete current directory')
    }

    await new Promise<void>((resolve) =>
      rimraf(outDir, {}, () => {
        logger.info(`Deleted output directory: '${outDir}'`)
        resolve()
      }),
    )
  }

  const categoryDirectoryPaths = Object.fromEntries(
    Object.entries(categoryHierarchy).map(([k, v]) => [
      k,
      path.join(outDir, v.split('.').join('/'), '..'),
    ]),
  )

  for (const categoryDirPath of Object.values(categoryDirectoryPaths)) {
    await mkdirp(categoryDirPath).then((_path) => {
      if (_path) {
        logger.info(`Created directory: '${_path}'`)
      } else {
        logger.info(`Directory '${categoryDirPath}' already exists`)
      }
    })
  }

  if (Object.keys(categoryContractInfo).length) {
    logger.info(
      `User has specified category - contracts correspondance, copying typechain dir`,
    )
    const contractsPath = path.join(outDir, 'contracts')
    await mkdirp(contractsPath)
    await fse.copy(typechainPath, contractsPath)
    logger.info(`Successfully copied typechain dir`)
  }

  logger.info(
    categoryDirectoryPaths,
    `Successfully created category directory structure`,
  )

  return categoryDirectoryPaths
}
