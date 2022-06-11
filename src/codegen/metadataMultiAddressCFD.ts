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
  mkCategoryAddressListContent,
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

export interface MetadataMultiAddressCFD extends SharedCFD {
  kind: CFDKind.METADATA_MULTI
  addresses: [zx.Address, ...zx.Address[]]
  serializedEntries: zx.AddressRecord<string>
  metadataEntryType: string
  importBigNumber: boolean
  addressImports: AddressCategoryImportDefRecord
}

interface IMkMetadataMultiAddressCFD {
  category: string
  categoryDir: string
  entry: zx.AddressRecord<Record<string, any>>
  schema: SonraCategorySchema
  categoryKindAndData: Record<string, CategoryKindAndData>
  categoryDirectoryPaths: CategoryDirectoryPaths
  outDir: string
}

export const mkMetadataMultiAddressCFD = ({
  category,
  entry,
  schema,
  categoryDir,
  categoryKindAndData,
  categoryDirectoryPaths,
  outDir,
}: IMkMetadataMultiAddressCFD): MetadataMultiAddressCFD => {
  const { serializedEntries, importDefRecord, importBigNumber, addresses } =
    serialize(category, entry, categoryKindAndData, categoryDirectoryPaths)

  return {
    kind: CFDKind.METADATA_MULTI,
    addresses,
    serializedEntries,
    metadataEntryType: printNode(zodToTs(schema).node),
    addressImports: importDefRecord,
    importBigNumber,
    category,
    categoryFileContent: mkFileContent(category),
    paths: mkCategoryPaths({ category, categoryDir, outDir }),
  }
}

export function codegenMetadataMultiAddress({
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
  addresses,
  category,
  metadataEntryType,
  serializedEntries,
  addressImports,
  kind,
  contract,
  contractFactory,
}: MetadataMultiAddressCFD): string {
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
import { Address, WithAddress } from '${paths.address}'
${addressImportContent}
${contractImportContent}

${categoryAddressTypeContent}

${categoryAddressListContent}

${guardFnContent}

${categoryMetadataTypeContent}

${categoryMetadataContent}

${contractContent}
`
}
