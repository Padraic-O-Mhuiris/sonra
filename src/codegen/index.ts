import fs from 'fs'
import { keys } from 'lodash'
import path from 'path'
import { SonraConfig } from '../config'
import { fetchAndValidate, SonraModel } from '../schema'
import { log } from '../utils'
import { bundleAddressFile } from './bundleAddressFile'
import { bundleContractTypes } from './bundleContractTypes'
import { createSonraDir } from './createSonraDir'
import { findTypechainDir } from './findTypechainDir'
import { generateFiles } from './generateFiles'
import { validateCategories } from './validateCategories'
import { validateContracts } from './validateContracts'

export async function run({ dir, model, fetch }: SonraConfig<SonraModel>) {
  const typechainDirPath = await findTypechainDir()
  log(`Typechain directory found at: ${typechainDirPath}`)

  const { factories, ...rest } = require(typechainDirPath) as {
    factories: any
  } & { [k in string]: any }

  const contractFactories = keys(rest)
  log(`Contract Factory names:\n ${contractFactories.join(',\n')}`)

  const dirPath = path.join(process.cwd(), dir)

  await createSonraDir(dirPath)
  await bundleContractTypes(dirPath, typechainDirPath)
  await bundleAddressFile(dirPath)

  const data = await fetchAndValidate(model, fetch)
  const categories = validateCategories(data)

  const contractFactoriesByCategory = validateContracts(data, contractFactories)

  const categoryFilesByCategory = generateFiles(
    categories,
    model,
    data,
    contractFactoriesByCategory,
  )

  for (const [category, file] of Object.entries(categoryFilesByCategory)) {
    await fs.promises.writeFile(path.join(dirPath, `${category}.ts`), file)
  }
}
