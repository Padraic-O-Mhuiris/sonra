import { includes } from 'lodash'
import { Address, reifyAddress } from '../address'
import {
  addressConstant,
  addressConstantWithPostFix,
  categoryAddressType,
} from './utils'

export interface CategorisedAddressImport {
  path: string
  addressConstants: string[]
  addressType: string
}

function buildImportsFromCategorisedAddresses(
  _categorisedAddresses: Address<string>[],
  uniqueCategories: string[],
) {
  const uniques = Array.from(new Set(_categorisedAddresses))
  const categories = Array.from(new Set(uniques.map(reifyAddress)))

  const categorisedAddressesByCategory: Record<string, Address<string>[]> = {}
  for (const category of categories) {
    categorisedAddressesByCategory[category] = uniques.filter((c) =>
      c.startsWith(category),
    )
  }

  const categorisedAddressImports: CategorisedAddressImport[] = []

  for (const [category, categorisedAddresses] of Object.entries(
    categorisedAddressesByCategory,
  )) {
    const path = `./${category}`
    const addressType = categoryAddressType(category)
    const addressConstants: string[] = []

    const isUniqueCategory = includes(uniqueCategories, category)
    for (const categorisedAddress of categorisedAddresses) {
      addressConstants.push(
        isUniqueCategory
          ? addressConstant(category)
          : addressConstantWithPostFix(
              category,
              reifyAddress(categorisedAddress),
            ),
      )
    }
    categorisedAddressImports.push({ path, addressConstants, addressType })
  }

  return categorisedAddressImports
}

type CategorisedAddressImportsByCategory = Record<
  string,
  CategorisedAddressImport[]
>

export function buildCategorisedAddressImportsByCategory(
  categories: [string, ...string[]],
  uniqueCategories: string[],
  categorisedAddresses: Record<string, Address<string>[]>,
): CategorisedAddressImportsByCategory {
  const categorisedAddressImportsByCategory: CategorisedAddressImportsByCategory =
    {}

  for (const category of categories) {
    categorisedAddressImportsByCategory[category] =
      buildImportsFromCategorisedAddresses(
        categorisedAddresses[category],
        uniqueCategories,
      )
  }

  return categorisedAddressImportsByCategory
}
