import { capitalize } from '../utils'

export type CategoryFileContent = {
  addressTypeBrand: string // __CategoryAddress__
  addressTypeBrandKey: string // __categoryAddress__
  addressType: string // CategoryAddress
  addressConstant: string // categoryAddress -> would be appended to in the case of multiple addresses
}

export const mkAddressTypeBrand = (c: string) => `__${capitalize(c)}Address__`
export const mkAddressTypeBrandKey = (c: string) => `__${c}Address__`
export const mkAddressType = (c: string) => `${capitalize(c)}Address`
export const mkAddressConstant = (c: string) => `${c}Address`

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

export const ADDRESS_FILE_CONTENT = `
import { ethers } from 'ethers'

export type __Address__ = {
  readonly __address__: void
}

export type Address = string & __Address__

export const isAddress = (address: string): address is Address => ethers.utils.isAddress(address)
`
