import { CategoryDirectoryPaths } from '../dir'
import { SonraCategorySchema } from '../types'
import { logger, mkCategoryAddressType, mkCategoryFilePath } from '../utils'
import { zx } from '../zodx'
import {
  CategoryKindAndData,
  CFDKind,
  SharedCFD,
} from './categoryFileDescription'
import { AddressCategoryImportDefRecord, serialize } from './serialize'
import { printNode, zodToTs } from 'zod-to-ts'

export interface MetadataMultiAddressCFD extends SharedCFD {
  kind: CFDKind.METADATA_MULTI
  addresses: [zx.Address, ...zx.Address[]]
  addressType: string
  metadataEntries: zx.AddressRecord<string>
  metadataType: string
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
}

export const mkMetadataMultiAddressCFD = ({
  category,
  entry,
  schema,
  categoryDir,
  categoryKindAndData,
  categoryDirectoryPaths,
}: IMkMetadataMultiAddressCFD): MetadataMultiAddressCFD => {
  logger.info(`Category kind for '${category}': ${CFDKind.METADATA_SINGLE}`)

  const { serializedEntries, importDefRecord, importBigNumber, addresses } =
    serialize(category, entry, categoryKindAndData, categoryDirectoryPaths)

  logger.info(
    serializedEntries,
    `Resulting serialized entry for category '${category}'`,
  )
  return {
    kind: CFDKind.METADATA_MULTI,
    addresses,
    metadataEntries: serializedEntries,
    addressType: mkCategoryAddressType(category),
    metadataType: printNode(zodToTs(schema).node),
    addressImports: importDefRecord,
    importBigNumber,
    category,
    filePath: mkCategoryFilePath(categoryDir, category),
  }
}
