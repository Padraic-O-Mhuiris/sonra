import { printNode, zodToTs } from 'zod-to-ts'
import { CategoryDirectoryPaths } from '../dir'
import { SonraCategorySchema } from '../types'
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
  mkContractContent,
  mkContractImportContent,
  mkFileContent,
  mkGuardFnContent,
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
  categoryFileContent: {
    addressConstant,
    addressType,
    addressTypeBrand,
    addressTypeBrandKey,
    metadataConstant,
    metadataType,
    contractConstant,
    infoConstant,
    infoListConstant,
    infoListType,
    infoRecordConstant,
    infoRecordType,
  },
  paths,
  address,
  metadataEntryType,
  addressImports,
  kind,
  category,
  serializedEntries,
  contract,
  contractFactory,
}: MetadataSingleAddressCFD): string {
  const categoryAddressTypeContent = mkCategoryAddressTypeContent({
    addressType,
    addressTypeBrand,
    addressTypeBrandKey,
  })

  const categoryMetadataTypeContent = mkCategoryMetadataTypeContent({
    metadataType,
    metadataEntryType,
  })

  const addressImportContent = Object.values(addressImports)
    .map(mkAddressImportContent)
    .join('\n')

  const categoryMetadataContent = mkCategoryMetadataContent({
    kind,
    category,
    addressType,
    metadataConstant,
    metadataType,
    serializedEntries,
    infoConstant,
    infoListConstant,
    infoListType,
    infoRecordConstant,
    infoRecordType,
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
${addressImportContent}
${contractImportContent}

${categoryAddressTypeContent}

export const ${addressConstant} = "${address}" as ${addressType}

${guardFnContent}

${categoryMetadataTypeContent}

${categoryMetadataContent}

${contractContent}
`
}
