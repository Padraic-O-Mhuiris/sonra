import { BigNumber } from 'ethers'
import { has } from 'lodash'
import path from 'path'
import { z } from 'zod'
import { CategoryDirectoryPaths } from '../dir'
import { zx } from '../zodx'
import { CategoryKindAndData, CFDKind } from './categoryFileDescription'
import { mkAddressConstant } from './fileContent'
import { relativePath } from './paths'

// The AddressCategoryImportDef is used for building the relative imports between files
export interface AddressCategoryImportDef {
  path: string
  addressConstants: string[]
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
                const [importCategory, address] =
                  zx.ZodCategorisedAddress.split(v)
                const { kind } = categoryKindAndData[importCategory]

                let addressConstant
                if (
                  kind === CFDKind.UNIQUE_ADDRESS ||
                  kind === CFDKind.METADATA_SINGLE
                ) {
                  addressConstant = mkAddressConstant(importCategory)
                } else {
                  addressConstant = mkAddressConstant(importCategory, address)
                }

                if (!has(importDefRecord, category)) {
                  importDefRecord[importCategory] = {
                    category: importCategory,
                    path: relativePath(
                      path.join(
                        categoryDirectoryPaths[category],
                        `${category}.ts`,
                      ),
                      path.join(
                        categoryDirectoryPaths[importCategory],
                        `${importCategory}.ts`,
                      ),
                    ),
                    addressConstants: [addressConstant],
                  }
                } else {
                  importDefRecord[importCategory].addressConstants.push(
                    addressConstant,
                  )
                }

                return addressConstant
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
