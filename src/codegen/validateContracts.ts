import { includes } from 'lodash'
import { SonraDataModel, SonraModel } from '../schema'
import { capitalize } from '../utils'
import { log } from '../utils'

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

export function validateContracts(
  { contracts }: SonraDataModel<SonraModel>,
  contractFactories: string[],
): Record<string, string> {
  const normalizedContracts = Object.entries(contracts).map(
    ([category, contractName]) => [
      category,
      `${normalizeContractName(contractName)}__factory`,
    ],
  )

  const contractFactoriesByCategory: Record<string, string> = {}
  for (const [category, name] of normalizedContracts) {
    if (!includes(contractFactories, name)) {
      throw new Error(
        `Could not find associated contract factory for ${contracts[category]}`,
      )
    }
    contractFactoriesByCategory[category] = name
  }

  log('ContractFactoriesByCategory: %O', contractFactoriesByCategory)
  return contractFactoriesByCategory
}
