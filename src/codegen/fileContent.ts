import { capitalize } from '../utils'
import { zx } from '../zodx'

export type CategoryFileContent = {
  addressTypeBrand: string // __CategoryAddress__
  addressTypeBrandKey: string // __categoryAddress__
  addressType: string // CategoryAddress
  addressConstant: string // categoryAddress -> would be appended to in the case of multiple addresses
}

export const mkAddressTypeBrand = (c: string) => `__${capitalize(c)}Address__`
export const mkAddressTypeBrandKey = (c: string) => `__${c}Address__`
export const mkAddressType = (c: string) => `${capitalize(c)}Address`
export const mkAddressConstant = (
  category: string,
  address: zx.Address | undefined = undefined,
): string =>
  !address
    ? `${category}Address`
    : `${mkAddressConstant(category)}_${address.slice(0, 6)}`

export const mkFileContent = (c: string) => ({
  addressTypeBrand: mkAddressTypeBrand(c),
  addressTypeBrandKey: mkAddressTypeBrandKey(c),
  addressType: mkAddressType(c),
  addressConstant: mkAddressConstant(c),
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

export const ${addressConstant}List: ${addressType}[] = [${addressConstants.join(
    ',\n',
  )}]
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
