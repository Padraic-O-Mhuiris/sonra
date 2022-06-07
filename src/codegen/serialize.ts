import { BigNumber } from 'ethers'
import { has } from 'lodash'
import path from 'path'
import { z } from 'zod'
import { CategoryDirectoryPaths } from '../dir'
import { zx } from '../zodx'
import { CategoryKindAndData, CFDKind } from './categoryFileDescription'
import { mkAddressConstant } from './fileContent'
import { relativePath } from './paths'
import { UnreachableCaseError } from 'ts-essentials'

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

            const stringify = (node: unknown): string => {
              const objectValidation = z.record(z.any()).safeParse(node)
              if (objectValidation.success) {
                const entries = Object.entries(objectValidation.data).reduce(
                  (acc, [k, v]) => `${acc}\n  ${k}: ${stringify(v)},`,
                  '',
                )
                return `{ ${entries}\n }`
              }

              const arrayValidation = z.array(z.any()).safeParse(node)
              if (arrayValidation.success) {
                const entries = arrayValidation.data.reduce(
                  (acc, v) => `${acc}\n ${stringify(v)},`,
                  '',
                )
                return `[ ${entries}\n ]`
              }

              if (zx.ZodCategorisedAddress.isCategorisedAddress(node)) {
                const [importCategory, address] =
                  zx.ZodCategorisedAddress.split(node)
                const { kind } = categoryKindAndData[importCategory]

                const addressConstant =
                  kind === CFDKind.UNIQUE_ADDRESS ||
                  kind === CFDKind.METADATA_SINGLE
                    ? mkAddressConstant(importCategory)
                    : mkAddressConstant(importCategory, address)

                if (!has(importDefRecord, importCategory)) {
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
                  importDefRecord[importCategory].addressConstants = [
                    ...importDefRecord[importCategory].addressConstants,
                    addressConstant,
                  ]
                }

                return addressConstant
              }

              const addressValidation = zx.address().safeParse(node)
              if (addressValidation.success) {
                return `'${addressValidation.data}' as Address`
              }

              const bigNumberValidation = BigNumber.isBigNumber(node)
              if (bigNumberValidation) {
                importBigNumber = true
                return `BigNumber.from('${node.toString()}')`
              }

              const dateValidation = z.date().safeParse(node)
              if (dateValidation.success) {
                return `new Date('${dateValidation.data.toISOString()}')`
              }

              return JSON.stringify(node)
            }

            return [zx.address().parse(addressKey), stringify(categoryEntry)]
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
