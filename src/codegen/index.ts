import fs from 'fs'
import { keys } from 'lodash'
import path from 'path'
import { SonraConfig } from '../config'
import { createSonraSchema } from '../schema'
import { SonraModel } from '../schema'
import { bundleAddressFile } from './bundleAddressFile'
import { bundleContractTypes } from './bundleContractTypes'
import { createSonraDir } from './createSonraDir'
import { findTypechainDir } from './findTypechainDir'
import { generateFiles } from './generateFiles'
import { validateCategories } from './validateCategories'
import { validateContracts } from './validateContracts'
import result from '../result.json'

import { z } from 'zod'

export async function run<M extends SonraModel>({
  dir,
  model,
}: SonraConfig<M>) {
  const typechainDirPath = await findTypechainDir()
  if (!typechainDirPath) {
    console.log('Contract types must be generated, ...exiting')
    return
  }

  const { factories, ...rest } = require(typechainDirPath) as {
    factories: any
  } & { [k in string]: any }

  const typechainFactoryNames = keys(rest)
  console.log(`Contract Factory names: ${typechainFactoryNames.join(', ')}`)

  const dirPath = path.join(process.cwd(), dir)
  if (!(await createSonraDir(dirPath))) {
    console.log('Something went wrong creating working directory, ...exiting')
    return
  }

  if (!(await bundleContractTypes(dirPath, typechainDirPath))) {
    console.log('Something went wrong copying typechain files, ...exiting')
    return
  }

  if (!(await bundleAddressFile(dirPath))) {
    console.log('Something went wrong creating address file, ...exiting')
    return
  }

  console.log('Creating schema from model')
  const schema = createSonraSchema<SonraModel>(model)

  console.log('Fetching data...')
  //const fetchResult = await fetch()

  console.log('Fetched data model, ...validating against schema')
  const schemaResult = schema.safeParse(result)

  if (!schemaResult.success) {
    console.error(schemaResult.error)
    console.log('Schema parse failed, ...exiting')
    return
  }

  const data = schemaResult.data

  const categories = validateCategories(data)
  if (!categories) {
    console.log('Categories could not be validated, ...exiting')
    return
  }

  console.log(`Categories: ${categories.join(', ')}`)
  console.log()
  console.log('Schema parse success, ...checking contracts correspondance')

  const categoryContractFactoryDict = validateContracts(
    data,
    typechainFactoryNames,
  )

  if (!categoryContractFactoryDict) {
    console.log(
      'Could not find all correspondances for contracts declared in the model, ...exiting',
    )
    return
  }

  const categoryFileDict = generateFiles(
    categories,
    model,
    data,
    categoryContractFactoryDict,
  )

  for (const [category, file] of Object.entries(categoryFileDict)) {
    try {
      await fs.promises.writeFile(path.join(dirPath, `${category}.ts`), file)
    } catch {
      console.log(`Something went wrong writing ${category}.ts, ...exiting`)
      return
    }
  }
}
