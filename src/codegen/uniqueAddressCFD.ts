import { logger } from '../utils'
import { zx } from '../zodx'
import { CFDKind, SharedCFD } from './categoryFileDescription'
import { mkCategoryAddressTypeContent, mkFileContent } from './fileContent'
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
  categoryFileContent,
  paths,
  address,
}: UniqueAddressCFD): string {
  const categoryAddressTypeContent =
    mkCategoryAddressTypeContent(categoryFileContent)
  return `
import { Address } from '${paths.address}'

${categoryAddressTypeContent}

export const ${categoryFileContent.addressConstant} = "${address}" as ${categoryFileContent.addressType}
`
}
