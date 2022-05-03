import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import { SonraConfig } from './config'
import { createSonraSchema } from './schema'
import { SonraModel } from './types'
import fileData from './file.json'

export async function run<M extends SonraModel>({
  typechainDir,
  dir,
  model,
  fetch,
}: SonraConfig<M>) {
  const dirPath = path.join(process.cwd(), dir)
  const typechainDirPath = path.join(process.cwd(), typechainDir)

  if (!fs.existsSync(typechainDirPath)) {
    console.log(
      `Path: ${typechainDirPath} does not exist for typechain types, ...exiting`,
    )
    return
  }

  const { factories, ...typechainTypes } = require(typechainDirPath)

  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath, { recursive: true })
  } else {
    console.log(`Path: ${dirPath} already exists, ...overwriting`)
    if (dirPath === process.cwd()) {
      console.error('cannot delete top level directory')
    }
    await new Promise<void>((resolve) => rimraf(dirPath, {}, () => resolve()))
    await fs.promises.mkdir(dirPath, { recursive: true })
  }

  const schema = createSonraSchema(model)
  console.log('Created schema from model, ...fetching data')
  const fetchResult = await fetch()

  console.log('Fetched data model, ...validating against schema')
  const schemaResult = schema.safeParse(fetchResult)

  if (!schemaResult.success) {
    console.log('Schema parse failed')
    console.error(schemaResult.error)
    return
  }
  const contractTypeNames = Object.keys(typechainTypes)
  const data = fileData
  console.error('Schema parse success, ...checking named contracts')

  const contractPaths = Object.fromEntries(
    Object.entries(data.contracts).map(([category, contractName]) => {
      contractName = contractName.includes('.')
        ? contractName.slice(0, contractName.indexOf('.'))
        : contractName

      const contractTypeName = `${contractName}__factory`
      if (!contractTypeNames.some((c) => c === contractTypeName)) {
        throw new Error(`${contractName} not found in typechain types`)
      }

      return [category, contractTypeName]
    }),
  )
  console.log(contractPaths)

  await fs.promises.writeFile(
    path.join(dirPath, 'file.json'),
    JSON.stringify(data, null, 2),
  )
  // eslint-disable-next-line
  // console.log(JSON.stringify(data, null, 2))
  // validate category contract names
  // validate category address & metadata
}
