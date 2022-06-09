import { CategoryHierarchy } from './validations/validateCategories'
import { CategoryContractInfo } from './validations/validateTypechain'
import rimraf from 'rimraf'
import fs from 'fs'
import fse from 'fs-extra'
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
    if (outDir === process.cwd()) {
      throw new Error('Cannot delete current directory')
    }

    await new Promise<void>((resolve) =>
      rimraf(outDir, {}, () => {
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
    await mkdirp(categoryDirPath)
  }

  if (Object.keys(categoryContractInfo).length) {
    const contractsPath = path.join(outDir, 'contracts')
    await mkdirp(contractsPath)
    await fse.copy(typechainPath, contractsPath)
  }

  return categoryDirectoryPaths
}
