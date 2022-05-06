import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import { log } from '../utils'

export async function bundleContractTypes(
  dirPath: string,
  typechainDirPath: string,
): Promise<void> {
  const sonraContractsPath = path.join(dirPath, 'contracts') // TODO user specified name
  await fs.promises.mkdir(sonraContractsPath)
  await fse.copy(typechainDirPath, sonraContractsPath)

  log(
    `Copied typechain types from ${typechainDirPath} to ${sonraContractsPath}`,
  )
}
