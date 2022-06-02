import { printNode, zodToTs } from 'zod-to-ts'
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

export interface MetadataSingleAddressCFD extends SharedCFD {
  kind: CFDKind.METADATA_SINGLE
  address: zx.Address
  addressType: string
  metadataEntry: string
  metadataType: string
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
}

export const mkMetadataSingleAddressCFD = ({
  category,
  entry,
  schema,
  categoryDir,
  categoryKindAndData,
  categoryDirectoryPaths,
}: IMkMetadataSingleAddressCFD): MetadataSingleAddressCFD => {
  logger.info(`Category kind for '${category}': ${CFDKind.METADATA_SINGLE}`)

  const { serializedEntries, importDefRecord, importBigNumber, addresses } =
    serialize(category, entry, categoryKindAndData, categoryDirectoryPaths)

  logger.info(
    serializedEntries,
    `Resulting serialized entry for category '${category}'`,
  )
  return {
    kind: CFDKind.METADATA_SINGLE,
    address: addresses[0],
    metadataEntry: serializedEntries[addresses[0]],
    addressType: mkCategoryAddressType(category),
    metadataType: printNode(zodToTs(schema).node),
    addressImports: importDefRecord,
    importBigNumber,
    category,
    filePath: mkCategoryFilePath(categoryDir, category),
  }
}
