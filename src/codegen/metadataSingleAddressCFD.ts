import { printNode, zodToTs } from 'zod-to-ts'
import { CategoryDirectoryPaths } from '../dir'
import { SonraCategorySchema } from '../types'
import { logger } from '../utils'
import { zx } from '../zodx'
import {
  CategoryKindAndData,
  CFDKind,
  SharedCFD,
} from './categoryFileDescription'
import {
  mkAddressImportContent,
  mkCategoryAddressTypeContent,
  mkCategoryMetadataContent,
  mkCategoryMetadataTypeContent,
  mkFileContent,
} from './fileContent'
import { mkCategoryPaths } from './paths'
import { AddressCategoryImportDefRecord, serialize } from './serialize'

export interface MetadataSingleAddressCFD extends SharedCFD {
  kind: CFDKind.METADATA_SINGLE
  address: zx.Address
  serializedEntries: zx.AddressRecord<string> // it's just one entry but easy to keep it uniform for codegen
  metadataEntryType: string
  importBigNumber: boolean
  addressImports: AddressCategoryImportDefRecord
}

interface IMkMetadataSingleAddressCFD {
  category: string
  categoryDir: string
  entry: zx.AddressRecord<Record<string, any>>
  schema: SonraCategorySchema
  categoryKindAndData: Record<string, CategoryKindAndData>
  categoryDirectoryPaths: CategoryDirectoryPaths
  outDir: string
}

export const mkMetadataSingleAddressCFD = ({
  category,
  entry,
  schema,
  categoryDir,
  outDir,
  categoryKindAndData,
  categoryDirectoryPaths,
}: IMkMetadataSingleAddressCFD): MetadataSingleAddressCFD => {
  logger.info(`Category kind for '${category}': ${CFDKind.METADATA_SINGLE}`)

  const { serializedEntries, importDefRecord, importBigNumber, addresses } =
    serialize(category, entry, categoryKindAndData, categoryDirectoryPaths)

  return {
    kind: CFDKind.METADATA_SINGLE,
    address: addresses[0],
    serializedEntries,
    metadataEntryType: printNode(zodToTs(schema).node),
    addressImports: importDefRecord,
    importBigNumber,
    category,
    categoryFileContent: mkFileContent(category),
    paths: mkCategoryPaths({ category, categoryDir, outDir }),
  }
}

export function codegenMetadataSingleAddress({
  categoryFileContent,
  paths,
  address,
  metadataEntryType,
  addressImports,
  kind,
  category,
  serializedEntries,
}: MetadataSingleAddressCFD): string {
  const categoryAddressTypeContent =
    mkCategoryAddressTypeContent(categoryFileContent)

  const categoryMetadataTypeContent = mkCategoryMetadataTypeContent({
    metadataType: categoryFileContent.metadataType,
    metadataEntryType,
  })
  console.log(addressImports)
  const addressImportContent = Object.values(addressImports)
    .map(mkAddressImportContent)
    .join('\n')

  const categoryMetadataContent = mkCategoryMetadataContent({
    kind,
    category,
    addressType: categoryFileContent.addressType,
    metadataConstant: categoryFileContent.metadataConstant,
    metadataType: categoryFileContent.metadataType,
    serializedEntries,
  })

  return `
import { Address } from '${paths.address}'
${addressImportContent}

${categoryAddressTypeContent}

export const ${categoryFileContent.addressConstant} = "${address}" as ${categoryFileContent.addressType}

${categoryMetadataTypeContent}
${categoryMetadataContent}
`
}
