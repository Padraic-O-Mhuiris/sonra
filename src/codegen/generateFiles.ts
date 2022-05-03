import { capitalize } from 'lodash'
import { SonraDataModel, SonraModel } from '../types'

export function generateFiles(
  categories: [string, ...string[]],
  data: SonraDataModel<SonraModel>,
  categoryContractFactoryDict: { [k in string]: string },
): { [k in string]: string } {
  const categoryFileDict: Record<string, string> = {}

  for (const category of categories) {
    const categoryAddresses = data.addresses[category]
    const addressType = capitalize(`${category}Address`)

    categoryFileDict[category] = `
import { Address, isAddress } from "./address"
import { ${categoryContractFactoryDict[category]} } from "../contracts"

export type ${addressType} = Address & { readonly ${addressType}: unique symbol }

export const ${category}Addresses: ${addressType}[] = [${categoryAddresses.join(
      ',\n',
    )}]

export const is${addressType} = (address: string): address is ${addressType} => isAddress(address) && ${category}Addresses.some((${category}Address) => ${category}Address === address)
`
  }

  return categoryFileDict
}
