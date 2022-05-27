import { ContractFactory } from 'ethers'
import fs from 'fs'
import { SonraContracts, SonraSchema, SonraSchemaKeys } from '../types'
import { capitalize, logger } from '../utils'

function validateTypechainPathExists(typechainPath: string): void {
  logger.info(`Validating typechain path: ${typechainPath}`)

  if (!fs.existsSync(typechainPath)) {
    throw new Error(
      `Could not find typechain directory at path: ${typechainPath}`,
    )
  }

  logger.info(`Typechain path: ${typechainPath} exists`)
}

const normalizeContractName = (contractName: string): string => {
  if (contractName.endsWith('.sol')) {
    return contractName.slice(0, -'.sol'.length)
  }
  if (contractName.endsWith('__factory')) {
    return contractName.slice(0, -'__factory'.length)
  }
  if (contractName.endsWith('.vy')) {
    return contractName.slice(0, -'.vy'.length)
  }
  return capitalize(contractName)
}

export type CategoryContractFactoryRecord = Record<
  SonraSchemaKeys<SonraSchema>,
  string
>

type TypechainValidationResult =
  | {
      usingTypechain: true
      contractFactoriesByCategory: CategoryContractFactoryRecord
    }
  | { usingTypechain: false }

export function validateTypechain(
  typechainPath: string,
  contracts?: SonraContracts<SonraSchema>,
): TypechainValidationResult {
  if (!contracts || !Object.keys(contracts).length) {
    logger.info('No contract factories specified')
    return { usingTypechain: false }
  }

  validateTypechainPathExists(typechainPath)

  logger.info('Importing typechain index file containing contract factories')
  let contractFactories
  try {
    const { factories, ...rest } = require(typechainPath) as Record<
      string,
      ContractFactory
    >
    contractFactories = rest
  } catch {
    throw new Error(
      `Could not import contract factories from typechain path: ${typechainPath}`,
    )
  }

  const contractFactoriesKeys = Object.keys(contractFactories)
  logger.info(`Found ${contractFactoriesKeys.length} contract factories`)

  const contractFactoriesByCategory: CategoryContractFactoryRecord = {}

  logger.info('Validating all categories can be paired with a category')

  for (const category of Object.keys(contracts)) {
    const name = `${normalizeContractName(contracts[category]!)}__factory`

    const contractFactoryKey = contractFactoriesKeys.find(
      (contractFactoryName) => contractFactoryName === name,
    )
    if (!contractFactoryKey) {
      throw new Error(
        `No contract factory found for category: '${category}' : contract: '${contracts[category]}'`,
      )
    }
    contractFactoriesByCategory[category] = contractFactoryKey
  }

  logger.info(contractFactoriesByCategory, 'Paired contract factories:')
  return { usingTypechain: true, contractFactoriesByCategory }
}
