import { includes } from 'lodash'
import {
  addressConstant,
  addressConstantWithPostFix,
  categoryAddressType,
} from './utils'
import { zx } from '../zodx'

export interface CategorisedAddressImport {
  path: string
  addressConstants: string[]
  addressType: string
}

function buildImportsFromCategorisedAddresses(
  _categorisedAddresses: zx.CategorisedAddress<string>[],
  uniqueCategories: string[],
) {
  const uniques = Array.from(new Set(_categorisedAddresses))
  const categories = Array.from<string>(
    new Set(
      uniques.map((categorisedAddress) =>
        zx.addressCategory().parse(categorisedAddress),
      ),
    ),
  )

  const categorisedAddressesByCategory: Record<
    string,
    zx.CategorisedAddress<string>[]
  > = {}
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
              zx.address(true).parse(categorisedAddress),
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
  categorisedAddresses: Record<string, zx.CategorisedAddress<string>[]>,
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
