import fs from 'fs'
import { keys } from 'lodash'
import path from 'path'
import { SonraConfig } from '../config'
import { fetchAndValidate, SonraModel } from '../schema'
import { log } from '../utils'
import { buildFileDescriptions } from './buildFileDescriptions'
import { bundleAddressFile } from './bundleAddressFile'
import { bundleContractTypes } from './bundleContractTypes'
import { createSonraDir } from './createSonraDir'
import { findTypechainDir } from './findTypechainDir'
import { generateFiles } from './generateFiles'
import { validateCategories } from './validateCategories'

export async function run({ dir, model, fetch }: SonraConfig<SonraModel>) {
  const dirPath = path.join(process.cwd(), dir)

  const typechainDirPath = await findTypechainDir()

  const { factories, ...rest } = require(typechainDirPath) as {
    factories: any
  } & { [k in string]: any }

  const contractFactories = keys(rest)
  log('Contract Factory names: %o', contractFactories)

  await createSonraDir(dirPath)
  await bundleContractTypes(dirPath, typechainDirPath)
  await bundleAddressFile(dirPath)

  const data = await fetchAndValidate(model, fetch)

  const categories = validateCategories(data)

  const fileDescriptionsByCategory = buildFileDescriptions(
    data,
    model,
    categories,
    contractFactories,
  )

  const categoryFilesByCategory = generateFiles(
    categories,
    fileDescriptionsByCategory,
  )

  for (const category of categories) {
    const file = categoryFilesByCategory[category]
    const fileName = `${category}.ts`
    await fs.promises.writeFile(path.join(dirPath, fileName), file)
    log('Wrote %s to file: %s', category, fileName)
  }
}
