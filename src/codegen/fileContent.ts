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
  contractConstant: string
  infoConstant: string
  infoRecordConstant: string
  infoListConstant: string
  infoRecordType: string
  infoListType: string
}

const isUpperCase = (s: string) => /^[A-Z]*$/.test(s)
export const normalize = (s: string) => (isUpperCase(s) ? s.toLowerCase() : s)

export const mkAddressTypeBrand = (c: string) =>
  `_${capitalize(normalize(c))}Address_`
export const mkAddressTypeBrandKey = (c: string) => `_${normalize(c)}Address_`
export const mkAddressType = (c: string) => `${capitalize(normalize(c))}Address`
export const mkAddressConstant = (
  category: string,
  address: zx.Address | undefined = undefined,
): string =>
  !address
    ? `${normalize(category)}Address`
    : `_${address.slice(0, 10)}_${mkAddressConstant(category)}`
export const mkMetadataType = (c: string) =>
  `${capitalize(normalize(c))}Metadata`
export const mkMetadataConstant = (c: string) => `${normalize(c)}Metadata`
export const mkContractConstant = (c: string) => `${normalize(c)}Contract`

export const mkInfoConstant = (c: string) => `${normalize(c)}Info`
export const mkInfoRecordConstant = (c: string) => `${normalize(c)}InfoRecord`
export const mkInfoListConstant = (c: string) => `${normalize(c)}InfoList`

export const mkInfoRecordType = (c: string) =>
  `${capitalize(normalize(c))}InfoRecord`
export const mkInfoListType = (c: string) =>
  `${capitalize(normalize(c))}InfoList`

export const mkFileContent = (c: string): CategoryFileContent => ({
  addressTypeBrand: mkAddressTypeBrand(c),
  addressTypeBrandKey: mkAddressTypeBrandKey(c),
  addressType: mkAddressType(c),
  addressConstant: mkAddressConstant(c),
  metadataType: mkMetadataType(c),
  metadataConstant: mkMetadataConstant(c),
  contractConstant: mkContractConstant(c),
  infoConstant: mkInfoConstant(c),
  infoRecordConstant: mkInfoRecordConstant(c),
  infoListConstant: mkInfoListConstant(c),
  infoRecordType: mkInfoRecordType(c),
  infoListType: mkInfoListType(c),
})

export const mkCategoryAddressTypeContent = ({
  addressTypeBrand,
  addressTypeBrandKey,
  addressType,
}: {
  addressTypeBrand: string
  addressTypeBrandKey: string
  addressType: string
}) => `
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
      addressConstant: addressConstants[idx]!,
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
  metadataType,
  serializedEntries,
  infoConstant,
  infoRecordConstant,
  infoListConstant,
  infoRecordType,
  infoListType,
}: {
  kind: CFDKind.METADATA_SINGLE | CFDKind.METADATA_MULTI
  category: string
  addressType: string
  metadataConstant: string
  metadataType: string
  serializedEntries: zx.AddressRecord<string>
  infoConstant: string
  infoRecordConstant: string
  infoListConstant: string
  infoRecordType: string
  infoListType: string
}) => {
  if (kind === CFDKind.METADATA_SINGLE) {
    const entry = Object.values(serializedEntries)[0]

    return `export const ${infoConstant}: ${metadataType} = ${entry}`
  }

  const recordEntries = Object.entries(serializedEntries)
    .map(([address, entry]) => {
      const addressConstantKey = mkAddressConstant(
        category,
        address as zx.Address,
      )
      return `  [${addressConstantKey}]: ${entry}`
    })
    .join(',\n')

  const listEntries = Object.keys(serializedEntries)
    .map((address) => {
      const addressConstantKey = mkAddressConstant(
        category,
        address as zx.Address,
      )
      return `{ ...${infoRecordConstant}[${addressConstantKey}]!, address: ${addressConstantKey} }`
    })
    .join(',\n')

  return `
export type ${infoRecordType} =  Record<${addressType}, ${metadataType}>

export const ${infoRecordConstant}: ${infoRecordType} = {\n ${recordEntries} \n}

export type ${infoListType} =  (${metadataType} & { address: ${addressType} })[]

export const ${infoListConstant}: ${infoListType} = [\n ${listEntries} \n]
`
}

export const mkGuardFnHeaderContent = ({
  addressType,
}: {
  addressType: string
}) =>
  `export const is${addressType} = (_address: string): _address is ${addressType} =>`

export const mkGuardFnContent = ({
  kind,
  addressType,
  addressConstant,
}: {
  kind: CFDKind
  addressType: string
  addressConstant: string
}) => {
  const header = mkGuardFnHeaderContent({ addressType })
  if (kind === CFDKind.METADATA_SINGLE || kind === CFDKind.UNIQUE_ADDRESS) {
    return `${header} _address === ${addressConstant}`
  }
  return `${header} ${addressConstant}es.some((${addressConstant}) => ${addressConstant} === _address)`
}

export const mkContractImportContent = ({
  contract,
  contractFactory,
  contractsPath,
}: {
  contract: string
  contractFactory: string
  contractsPath: string
}) => `import type { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers"
import { ${contract}, ${contractFactory} } from "${contractsPath}"`

export const mkContractContent = ({
  contract,
  contractFactory,
  contractConstant,
  addressConstant,
  addressType,
}: {
  contract: string
  contractFactory: string
  contractConstant: string
  addressConstant: string
  addressType: string
}) =>
  `export const ${contractConstant} = (_${addressConstant}: ${addressType}, _signerOrProvider: Signer | Provider): ${contract} => ${contractFactory}.connect(_${addressConstant}, _signerOrProvider)`

export const ADDRESS_FILE_CONTENT = `
import { ethers } from 'ethers'

export type _Address_ = {
  readonly _address_: void
}

export type Address = string & _Address_

export const isAddress = (address: string): address is Address => ethers.utils.isAddress(address)
`
