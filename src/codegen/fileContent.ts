import { capitalize } from '../utils'
import { zx } from '../zodx'
import { CFDKind } from './categoryFileDescription'
import { AddressCategoryImportDef } from './serialize'

export type CategoryFileContent = {
  addressTypeBrand: string // __CategoryAddress__
  addressTypeBrandKey: string // __categoryAddress__
  addressType: string // CategoryAddress
  addressConstant: string // categoryAddress -> would be appended to in the case of multiple addresses
  metadataType: string
  metadataConstant: string
}

const isUpperCase = (s: string) => /^[A-Z]*$/.test(s)
const normalize = (s: string) => (isUpperCase(s) ? s.toLowerCase() : s)

export const mkAddressTypeBrand = (c: string) =>
  `__${capitalize(normalize(c))}Address__`
export const mkAddressTypeBrandKey = (c: string) => `__${normalize(c)}Address__`
export const mkAddressType = (c: string) => `${capitalize(normalize(c))}Address`
export const mkAddressConstant = (
  category: string,
  address: zx.Address | undefined = undefined,
): string =>
  !address
    ? `${normalize(category)}Address`
    : `${mkAddressConstant(category)}_${address.slice(0, 6)}`
export const mkMetadataType = (c: string) =>
  `${capitalize(normalize(c))}Metadata`
export const mkMetadataConstant = (c: string) => `${c}Metadata`

export const mkFileContent = (c: string) => ({
  addressTypeBrand: mkAddressTypeBrand(c),
  addressTypeBrandKey: mkAddressTypeBrandKey(c),
  addressType: mkAddressType(c),
  addressConstant: mkAddressConstant(c),
  metadataType: mkMetadataType(c),
  metadataConstant: mkMetadataConstant(c),
})

export const mkCategoryAddressTypeContent = ({
  addressTypeBrand,
  addressTypeBrandKey,
  addressType,
}: CategoryFileContent) => `
type ${addressTypeBrand} = {
  readonly ${addressTypeBrandKey}: void
}
export type ${addressType} = Address & ${addressTypeBrand}
`

export const mkCategoryAddressConstant = ({
  address,
  addressType,
  addressConstant,
}: {
  address: zx.Address
  addressType: string
  addressConstant: string
}) => `export const ${addressConstant} = "${address}" as ${addressType}`

export const mkCategoryAddressListContent = ({
  category,
  addressType,
  addressConstant,
  addresses,
}: {
  category: string
  addressType: string
  addressConstant: string
  addresses: [zx.Address, ...zx.Address[]]
}) => {
  const addressConstants = addresses.map((address) =>
    mkAddressConstant(category, address),
  )

  const addressConstantEntries = addresses.map((address, idx) =>
    mkCategoryAddressConstant({
      address,
      addressType,
      addressConstant: addressConstants[idx],
    }),
  )
  return `
${addressConstantEntries.join('\n')}

export const ${addressConstant}es: ${addressType}[] = [${addressConstants.join(
    ',\n',
  )}]
`
}

export const mkCategoryMetadataTypeContent = ({
  metadataType,
  metadataEntryType,
}: {
  metadataType: string
  metadataEntryType: string
}) => `export type ${metadataType} = ${metadataEntryType}`

export const mkAddressImportContent = ({
  path,
  addressConstants,
  category,
}: AddressCategoryImportDef): string =>
  `import { ${mkAddressType(category)}, ${addressConstants.join(
    ', ',
  )} } from '${path}'`

export const mkCategoryMetadataContent = ({
  kind,
  category,
  addressType,
  metadataConstant,
  metadataType,
  serializedEntries,
}: {
  kind: CFDKind.METADATA_SINGLE | CFDKind.METADATA_MULTI
  category: string
  addressType: string
  metadataConstant: string
  metadataType: string
  serializedEntries: zx.AddressRecord<string>
}) => {
  if (kind === CFDKind.METADATA_SINGLE) {
    const entry = Object.values(serializedEntries)[0]

    return `export const ${metadataConstant}: ${metadataType} = ${entry}`
  }

  const entries = Object.entries(serializedEntries)
    .map(([address, entry]) => {
      const addressConstantKey = mkAddressConstant(
        category,
        address as zx.Address,
      )
      return `  [${addressConstantKey}]: ${entry}`
    })
    .join(',\n')

  return `export type ${metadataType}Record = Record<${addressType}, ${metadataType}>
export const ${metadataConstant}Record: ${metadataType}Record = {\n ${entries} \n}
`
}

export const ADDRESS_FILE_CONTENT = `
import { ethers } from 'ethers'

export type __Address__ = {
  readonly __address__: void
}

export type Address = string & __Address__

export const isAddress = (address: string): address is Address => ethers.utils.isAddress(address)
`
