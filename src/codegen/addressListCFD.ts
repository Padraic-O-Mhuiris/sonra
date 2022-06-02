import { logger } from '../utils'
import { zx } from '../zodx'
import { CFDKind, SharedCFD } from './categoryFileDescription'
import {
  mkCategoryAddressListContent,
  mkCategoryAddressTypeContent,
  mkFileContent,
} from './fileContent'
import { mkCategoryPaths } from './paths'

export interface AddressListCFD extends SharedCFD {
  kind: CFDKind.ADDRESS_LIST
  addresses: [zx.Address, ...zx.Address[]]
}

interface IMkAddressListCFD {
  category: string
  addresses: [zx.Address, ...zx.Address[]]
  categoryDir: string
  outDir: string
}

export const mkAddressListCFD = ({
  category,
  addresses,
  categoryDir,
  outDir,
}: IMkAddressListCFD): AddressListCFD => {
  logger.info(`Category kind for '${category}': ${CFDKind.ADDRESS_LIST}`)

  return {
    kind: CFDKind.ADDRESS_LIST,
    addresses,
    category,
    categoryFileContent: mkFileContent(category),
    paths: mkCategoryPaths({ category, categoryDir, outDir }),
  }
}

export function codegenAddressList({
  categoryFileContent,
  paths,
  addresses,
  category,
}: AddressListCFD): string {
  const categoryAddressTypeContent =
    mkCategoryAddressTypeContent(categoryFileContent)
  const categoryAddressListContent = mkCategoryAddressListContent({
    category,
    addresses,
    addressConstant: categoryFileContent.addressConstant,
    addressType: categoryFileContent.addressType,
  })
  return `
import { Address } from '${paths.address}'

${categoryAddressTypeContent}
${categoryAddressListContent}
`
}
