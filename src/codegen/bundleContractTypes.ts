import copy from 'recursive-copy'
import path from 'path'

export async function bundleContractTypes(
  dirPath: string,
  typechainDirPath: string,
): Promise<boolean> {
  const typechainSonraPath = path.join(dirPath, 'contracts')
  try {
    await copy(typechainSonraPath, typechainDirPath)
  } catch {
    return false
  }
  return true
}
