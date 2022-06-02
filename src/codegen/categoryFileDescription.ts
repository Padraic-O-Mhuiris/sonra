import { logger } from '../utils'
import { get, includes } from 'lodash'
import { z } from 'zod'
import { CategoryDirectoryPaths } from '../dir'
import { SonraCategorySchema, SonraDataModel, SonraSchema } from '../types'
import { CategoryHierarchy } from '../validations/validateCategories'
import { zx } from '../zodx'
import { AddressListCFD, mkAddressListCFD } from './addressListCFD'
import {
  GenericParent,
  GenericParentCFD,
  mkGenericParentCFD,
} from './genericParentCFD'
import {
  MetadataMultiAddressCFD,
  mkMetadataMultiAddressCFD,
} from './metadataMultiAddressCFD'
import {
  MetadataSingleAddressCFD,
  mkMetadataSingleAddressCFD,
} from './metadataSingleAddressCFD'
import { mkUniqueAddressCFD, UniqueAddressCFD } from './uniqueAddressCFD'

export enum CFDKind {
  UNIQUE_ADDRESS = 'UNIQUE_ADDRESS', // unique address, no metadata
  ADDRESS_LIST = 'ADDRESS_LIST', // list of addresses, no metadata
  METADATA_SINGLE = 'METADATA_SINGLE', // single address with arbitrary metadata
  METADATA_MULTI = 'METADATA_MULTI', // multiple addresses with arbitrary metadata
  GENERIC_PARENT = 'GENRIC_PARENT', // category abstracting information on multiple categories
}

export interface SharedCFD {
  category: string
  filePath: string
  contract?: string // if there is a contract correspondance
  contractFactory?: string // if there is a contract correspondance
  addressType: string
}

export type CategoryFileDescription =
  | UniqueAddressCFD
  | AddressListCFD
  | MetadataSingleAddressCFD
  | MetadataMultiAddressCFD
  | GenericParentCFD

export type CategoryKindAndData =
  | {
      kind: CFDKind.UNIQUE_ADDRESS
      data: zx.Address
    }
  | { kind: CFDKind.ADDRESS_LIST; data: [zx.Address, ...zx.Address[]] }
  | {
      kind: CFDKind.METADATA_MULTI | CFDKind.METADATA_SINGLE
      data: zx.AddressRecord<Record<string, any>>
    }
  | {
      kind: CFDKind.METADATA_MULTI | CFDKind.METADATA_SINGLE
      data: zx.AddressRecord<Record<string, any>>
    }
  | { kind: CFDKind.GENERIC_PARENT; data: GenericParent }

const buildCategoryKindAndDataRecord = <T extends SonraSchema>(
  categories: string[],
  dataModel: SonraDataModel<T>,
  categoryHierarchy: CategoryHierarchy,
): Record<string, CategoryKindAndData> =>
  categories.reduce((acc, category) => {
    const categoryData = get(dataModel, categoryHierarchy[category])

    const addressValidation = zx.address().safeParse(categoryData)
    if (addressValidation.success)
      return {
        ...acc,
        [category]: {
          kind: CFDKind.UNIQUE_ADDRESS,
          data: addressValidation.data,
        },
      }

    const nonEmptyAddressArrayValidation = zx
      .address()
      .array()
      .nonempty()
      .safeParse(categoryData)
    if (nonEmptyAddressArrayValidation.success)
      return {
        ...acc,
        [category]: {
          kind: CFDKind.ADDRESS_LIST,
          data: nonEmptyAddressArrayValidation.data,
        },
      }

    const addressRecordValidation = zx
      .address()
      .record(z.record(z.any()))
      .safeParse(categoryData)
    if (addressRecordValidation.success) {
      if (Object.keys(addressRecordValidation.data).length === 1)
        return {
          ...acc,
          [category]: {
            kind: CFDKind.METADATA_SINGLE,
            data: addressRecordValidation.data,
          },
        }
      if (Object.keys(addressRecordValidation.data).length > 1)
        return {
          ...acc,
          [category]: {
            kind: CFDKind.METADATA_MULTI,
            data: addressRecordValidation.data,
          },
        }
    }

    const genericRecordValidation = z.record(z.any()).safeParse(categoryData)
    if (
      genericRecordValidation.success &&
      Object.keys(genericRecordValidation.data).every((category) =>
        includes(categories, category),
      )
    ) {
      return {
        ...acc,
        [category]: {
          kind: CFDKind.GENERIC_PARENT,
          data: genericRecordValidation.data,
        },
      }
    }

    throw new Error(
      `Could not determine CategoryKindAndData for category: ${category}`,
    )
  }, {} as Record<string, CategoryKindAndData>)

export function categoryFileDescriptions<T extends SonraSchema>(
  categories: string[],
  categoryHierarchy: CategoryHierarchy,
  categoryDirectoryPaths: CategoryDirectoryPaths,
  schema: SonraSchema,
  dataModel: SonraDataModel<T>,
): (CategoryFileDescription | {})[] {
  const categoryKindAndData: Record<string, CategoryKindAndData> =
    buildCategoryKindAndDataRecord(categories, dataModel, categoryHierarchy)
  return categories.map((category) => {
    const categoryDir = categoryDirectoryPaths[category]
    const categorySchema = get(schema, categoryHierarchy[category])

    const { kind, data } = categoryKindAndData[category]
    logger.info(
      { kind, data },
      `categoryKindAndData for category: '${category}'`,
    )

    switch (kind) {
      case CFDKind.UNIQUE_ADDRESS:
        return mkUniqueAddressCFD({ address: data, category, categoryDir })
      case CFDKind.ADDRESS_LIST:
        return mkAddressListCFD({ addresses: data, category, categoryDir })
      case CFDKind.METADATA_SINGLE:
        return mkMetadataSingleAddressCFD({
          entry: data,
          category,
          categoryDir,
          schema: categorySchema as SonraCategorySchema,
          categoryKindAndData,
          categoryDirectoryPaths,
        })
      case CFDKind.METADATA_MULTI:
        return mkMetadataMultiAddressCFD({
          entry: data,
          category,
          categoryDir,
          schema: categorySchema as SonraCategorySchema,
          categoryKindAndData,
          categoryDirectoryPaths,
        })
      case CFDKind.GENERIC_PARENT:
        return mkGenericParentCFD({ entry: data, category, categoryDir })
    }
  })
}
