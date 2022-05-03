import copy from 'recursive-copy'
import path from 'path'
import fs from 'fs'

export async function bundleContractTypes(
  dirPath: string,
  typechainDirPath: string,
): Promise<boolean> {
  const typechainSonraPath = path.join(dirPath, 'contracts')
  try {
    await fs.promises.mkdir(typechainSonraPath)
    await copy(typechainSonraPath, typechainDirPath)
  } catch (e) {
    console.error(e)
    return false
  }
  return true
}
