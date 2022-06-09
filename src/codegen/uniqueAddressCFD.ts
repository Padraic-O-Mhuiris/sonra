import { logger } from '../utils'
import { zx } from '../zodx'
import { CFDKind, SharedCFD } from './categoryFileDescription'
import {
  mkCategoryAddressTypeContent,
  mkContractImportContent,
  mkFileContent,
  mkGuardFnContent,
} from './fileContent'
import { mkCategoryPaths } from './paths'

export interface UniqueAddressCFD extends SharedCFD {
  kind: CFDKind.UNIQUE_ADDRESS
  address: zx.Address
}

interface IMkUniqueAddressCFD {
  address: zx.Address
  category: string
  categoryDir: string
  outDir: string
}

export const mkUniqueAddressCFD = ({
  address,
  category,
  categoryDir,
  outDir,
}: IMkUniqueAddressCFD): UniqueAddressCFD => {
  logger.info(`Category kind for '${category}': ${CFDKind.UNIQUE_ADDRESS}`)

  return {
    kind: CFDKind.UNIQUE_ADDRESS,
    address,
    category,
    categoryFileContent: mkFileContent(category),
    paths: mkCategoryPaths({ category, categoryDir, outDir }),
  }
}

export function codegenUniqueAddress({
  categoryFileContent: {
    addressType,
    addressTypeBrand,
    addressTypeBrandKey,
    addressConstant,
  },
  kind,
  paths,
  address,
  contract,
  contractFactory,
}: UniqueAddressCFD): string {
  const categoryAddressTypeContent = mkCategoryAddressTypeContent({
    addressType,
    addressTypeBrand,
    addressTypeBrandKey,
  })
  const guardFnContent = mkGuardFnContent({
    addressType,
    kind,
    addressConstant,
  })

  const contractImportContent = contractFactory
    ? mkContractImportContent({
        contract: contract!,
        contractFactory,
        contractsPath: paths.contracts,
      })
    : ''

  return `
import { Address } from '${paths.address}'
${contractImportContent}
${categoryAddressTypeContent}
export const ${addressConstant} = "${address}" as ${addressType}
${guardFnContent}
`
}
