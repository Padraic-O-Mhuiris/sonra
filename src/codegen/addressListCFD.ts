import { zx } from '../zodx'
import { CFDKind, SharedCFD } from './categoryFileDescription'
import {
  mkCategoryAddressListContent,
  mkCategoryAddressTypeContent,
  mkContractContent,
  mkContractImportContent,
  mkFileContent,
  mkGuardFnContent,
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
  return {
    kind: CFDKind.ADDRESS_LIST,
    addresses,
    category,
    categoryFileContent: mkFileContent(category),
    paths: mkCategoryPaths({ category, categoryDir, outDir }),
  }
}

export function codegenAddressList({
  categoryFileContent: {
    addressType,
    addressTypeBrand,
    addressConstant,
    addressTypeBrandKey,
    contractConstant,
  },
  kind,
  paths,
  addresses,
  category,
  contract,
  contractFactory,
}: AddressListCFD): string {
  const categoryAddressTypeContent = mkCategoryAddressTypeContent({
    addressType,
    addressTypeBrand,
    addressTypeBrandKey,
  })
  const categoryAddressListContent = mkCategoryAddressListContent({
    category,
    addresses,
    addressConstant,
    addressType,
  })
  const guardFnContent = mkGuardFnContent({
    kind,
    addressType,
    addressConstant,
  })

  const contractImportContent = contractFactory
    ? mkContractImportContent({
        contract: contract!,
        contractFactory,
        contractsPath: paths.contracts,
      })
    : ''

  const contractContent = contractFactory
    ? mkContractContent({
        contract: contract!,
        contractFactory,
        contractConstant,
        addressConstant,
        addressType,
      })
    : ''

  return `
import { Address } from '${paths.address}'
${contractImportContent}

${categoryAddressTypeContent}

${categoryAddressListContent}

${guardFnContent}

${contractContent}
`
}
