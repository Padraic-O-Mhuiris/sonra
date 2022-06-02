import { BigNumber } from 'ethers'
import { has } from 'lodash'
import { z } from 'zod'
import { CategoryDirectoryPaths } from '../dir'
import {
  logger,
  mkAddressConstant,
  mkCategoryAddressType,
  mkCategoryFilePath,
} from '../utils'
import { zx } from '../zodx'
import { CategoryKindAndData, CFDKind } from './categoryFileDescription'

// The AddressCategoryImportDef is used for building the relative imports between files
export interface AddressCategoryImportDef {
  path: string
  addressConstants: string[]
  addressType: string
  category: string
}

export type AddressCategoryImportDefRecord = Record<
  string,
  AddressCategoryImportDef
>

interface SerializedResult {
  importDefRecord: AddressCategoryImportDefRecord
  serializedEntries: zx.AddressRecord<string>
  importBigNumber: boolean
  addressConstants: [string, ...string[]]
  addresses: [zx.Address, ...zx.Address[]]
}

export function serialize(
  category: string,
  obj: zx.AddressRecord<Record<string, any>>,
  categoryKindAndData: Record<string, CategoryKindAndData>,
  categoryDirectoryPaths: CategoryDirectoryPaths,
): SerializedResult {
  const importDefRecord: AddressCategoryImportDefRecord = {}
  let importBigNumber = false
  const addressConstants: string[] = []
  const addresses: zx.Address[] = []

  const serializedEntries = zx
    .address()
    .record(z.string())
    .parse(
      Object.fromEntries(
        Object.entries(obj).map(
          ([addressKey, categoryEntry]: [string, Record<string, any>]) => {
            addresses.push(zx.address().parse(addressKey))
            addressConstants.push(
              mkAddressConstant(
                category,
                categoryKindAndData[category].kind === CFDKind.METADATA_MULTI
                  ? zx.address().parse(addressKey)
                  : undefined,
              ),
            )

            const entry = JSON.stringify(categoryEntry, (_, v) => {
              if (zx.ZodCategorisedAddress.isCategorisedAddress(v)) {
                const [category, address] = zx.ZodCategorisedAddress.split(v)
                const { kind } = categoryKindAndData[category]

                let addressConstant
                if (kind === CFDKind.UNIQUE_ADDRESS) {
                  addressConstant = mkAddressConstant(category)
                } else {
                  addressConstant = mkAddressConstant(category, address)
                }

                const categoryDir = categoryDirectoryPaths[category]
                if (!has(importDefRecord, category)) {
                  importDefRecord[category] = {
                    category,
                    addressType: mkCategoryAddressType(category),
                    path: mkCategoryFilePath(categoryDir, category),
                    addressConstants: [addressConstant],
                  }
                } else {
                  importDefRecord[category].addressConstants.push(
                    addressConstant,
                  )
                }

                return `${addressConstant}`
              }

              const addressValidation = zx.address().safeParse(v)
              if (addressValidation.success) {
                return `${addressValidation.data} as Address`
              }

              if (BigNumber.isBigNumber(v)) {
                importBigNumber = true
                return `BigNumber.from('${v.toString()}')`
              }

              const dateValidation = z.date().safeParse(v)
              if (dateValidation.success) {
                return `new Date('${dateValidation.data.toISOString()}')`
              }

              return v
            })

            return [zx.address().parse(addressKey), entry]
          },
        ),
      ),
    )

  return {
    serializedEntries,
    importDefRecord,
    importBigNumber,
    addressConstants: z.string().array().nonempty().parse(addressConstants),
    addresses: zx.address().array().nonempty().parse(addresses),
  }
}
