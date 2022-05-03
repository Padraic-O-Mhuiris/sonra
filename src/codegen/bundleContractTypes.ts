import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'

export async function bundleContractTypes(
  dirPath: string,
  typechainDirPath: string,
): Promise<boolean> {
  const typechainSonraPath = path.join(dirPath, 'contracts')
  try {
    await fs.promises.mkdir(typechainSonraPath)
    await fse.copy(typechainDirPath, typechainSonraPath)
  } catch (e) {
    console.error(e)
    return false
  }
  return true
}
