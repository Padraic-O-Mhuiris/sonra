import { includes } from 'lodash'
import { printNode, zodToTs } from 'zod-to-ts'
import { SonraDataModel, SonraModel } from '../schema'
import { log } from '../utils'
import { Address } from '../zod'
import {
  buildCategorisedAddressImportsByCategory,
  CategorisedAddressImport,
} from './buildCategorisedAddressImports'
import {
  buildMetadataEntriesByAddress,
  buildSonraTrieByCategoryAndAddress,
  getRootValuesByCategory,
} from './buildTrie'
import { buildUniqueCategories } from './buildUniqueCategories'
import {
  addressConstant,
  addressConstantWithPostFix,
  categoryAddressType,
} from './utils'
import { validateCategorisedAddresses } from './validateCategorisedAddresses'
import { validateContracts } from './validateContracts'

interface SonraFileDescription {
  contractFactory: string
  addresses: [Address, ...Address[]]
  addressImports: CategorisedAddressImport[]
  addressConstantsByAddress: Record<Address, string>
  addressType: string
  metadataType: string
  importBigNumber: boolean
  isUnique: boolean
  metadataEntriesByAddress: Record<Address, string>
}

export type FileDescriptionsByCategory = Record<string, SonraFileDescription>
export function buildFileDescriptions(
  data: SonraDataModel<SonraModel>,
  model: SonraModel,
  categories: [string, ...string[]],
  contractFactories: string[],
): FileDescriptionsByCategory {
  const contractFactoriesByCategory = validateContracts(data, contractFactories)
  const categorisedAddressesByCategory = validateCategorisedAddresses(
    data,
    categories,
  )

  const uniqueCategories = buildUniqueCategories(data)
  const categorisedAddressImportsByCategory =
    buildCategorisedAddressImportsByCategory(
      categories,
      uniqueCategories,
      categorisedAddressesByCategory,
    )
  const bigNumbersByCategory = getRootValuesByCategory(data, 'BIGNUMBER')

  const fileDescriptionByCategory: FileDescriptionsByCategory = {}

  const trieByCategoryAndAddress = buildSonraTrieByCategoryAndAddress(
    data.metadata,
  )
  for (const category of categories) {
    const contractFactory = contractFactoriesByCategory[category]
    const addresses = data.addresses[category]

    const isUnique = includes(uniqueCategories, category)

    const addressConstantsByAddress = Object.fromEntries(
      addresses.map((address) => [
        address,
        isUnique
          ? addressConstant(category)
          : addressConstantWithPostFix(category, address),
      ]),
    ) as Record<Address, string>

    const addressImports = categorisedAddressImportsByCategory[category]

    const metadataEntriesByAddress = buildMetadataEntriesByAddress(
      trieByCategoryAndAddress[category],
      uniqueCategories,
    )
    const importBigNumber = !!bigNumbersByCategory[category].length

    const addressType = categoryAddressType(category)
    const metadataType = printNode(zodToTs(model[category]).node)

    log('%s metadata: %s', category, metadataEntriesByAddress)

    fileDescriptionByCategory[category] = {
      contractFactory,
      addresses,
      addressImports,
      addressType,
      addressConstantsByAddress,
      metadataType,
      importBigNumber,
      isUnique,
      metadataEntriesByAddress,
    }
  }

  return fileDescriptionByCategory
}
