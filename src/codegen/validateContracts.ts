import { SonraDataModel, SonraModel } from '../types'
import { capitalize } from '../utils'

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
  contractFactoryNames: string[],
): { [k in string]: string } | null {
  const normalizedContracts = Object.entries(contracts).map(
    ([category, contractName]) => [
      category,
      `${normalizeContractName(contractName)}__factory`,
    ],
  )

  const contractCategoryDict: Record<string, string> = {}
  for (const [category, contractName] of normalizedContracts) {
    if (
      !contractFactoryNames.some(
        (contractFactoryName) => contractFactoryName === contractName,
      )
    ) {
      console.log(
        `Could not find associated contract factory for ${contracts[category]}`,
      )
      return null
    }
    contractCategoryDict[category] = contractName
  }
  return contractCategoryDict
}
