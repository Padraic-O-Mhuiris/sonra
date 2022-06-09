import { ContractFactory } from 'ethers'
import fs from 'fs'
import { SonraContracts, SonraSchema } from '../types'
import { capitalize } from '../utils'

function validateTypechainPathExists(typechainPath: string): void {
  if (!fs.existsSync(typechainPath)) {
    throw new Error(
      `Could not find typechain directory at path: ${typechainPath}`,
    )
  }
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

export type CategoryContractInfo = Record<
  string,
  {
    contractFactory: string
    contract: string
  }
>

export function validateTypechain(
  typechainPath: string,
  contracts?: SonraContracts<SonraSchema>,
): CategoryContractInfo {
  if (!contracts || !Object.keys(contracts).length) {
    return {}
  }

  validateTypechainPathExists(typechainPath)

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

  const categoryContractInfo: CategoryContractInfo = {}

  for (const category of Object.keys(contracts)) {
    const contract = `${normalizeContractName(contracts[category]!)}`

    const contractFactory = `${normalizeContractName(
      contracts[category]!,
    )}__factory`

    const contractFactoryKey = contractFactoriesKeys.find(
      (contractFactoryName) => contractFactoryName === contractFactory,
    )
    if (!contractFactoryKey) {
      throw new Error(
        `No contract factory found for category: '${category}' : contract: '${contracts[category]}'`,
      )
    }
    categoryContractInfo[category] = { contract, contractFactory }
  }

  return categoryContractInfo
}
