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
import { mkFileContent } from './fileContent'
import { mkCategoryPaths } from './paths'
import { AddressCategoryImportDefRecord, serialize } from './serialize'

export interface MetadataMultiAddressCFD extends SharedCFD {
  kind: CFDKind.METADATA_MULTI
  addresses: [zx.Address, ...zx.Address[]]
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
  logger.info(`Category kind for '${category}': ${CFDKind.METADATA_SINGLE}`)

  const { serializedEntries, importDefRecord, importBigNumber, addresses } =
    serialize(category, entry, categoryKindAndData, categoryDirectoryPaths)

  return {
    kind: CFDKind.METADATA_MULTI,
    addresses,
    metadataEntries: serializedEntries,
    metadataType: printNode(zodToTs(schema).node),
    addressImports: importDefRecord,
    importBigNumber,
    category,
    categoryFileContent: mkFileContent(category),
    paths: mkCategoryPaths({ category, categoryDir, outDir }),
  }
}
