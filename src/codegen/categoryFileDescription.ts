import { zx } from '../zodx'

export enum CategoryFileDescriptionKind {
  UNIQUE_ADDRESS = 'UNIQUE_ADDRESS', // unique address, no metadata
  ADDRESS_LIST = 'ADDRESS_LIST', // list of addresses, no metadata
  METADATA_SINGLE = 'METADATA_SINGLE', // single address with arbitrary metadata
  METADATA_MULTI = 'METADATA_MULTI', // multiple addresses with arbitrary metadata
}

export type CategoryFileDescriptionUniqueAddress = {
  kind: CategoryFileDescriptionKind.UNIQUE_ADDRESS
  address: zx.Address
}

export type CategoryFileDescriptionAddressList = {
  kind: CategoryFileDescriptionKind.ADDRESS_LIST
  addresses: [zx.Address, ...zx.Address[]]
}

export type CategoryFileDescriptionMetadataSingle = {
  kind: CategoryFileDescriptionKind.METADATA_SINGLE
  address: zx.Address
}

export type CategoryFileDescriptionMetadataMulti = {
  kind: CategoryFileDescriptionKind.METADATA_MULTI
  addresses: [zx.Address, ...zx.Address[]]
}

export type CategoryFileDescription =
  | CategoryFileDescriptionUniqueAddress
  | CategoryFileDescriptionAddressList
  | CategoryFileDescriptionMetadataSingle
  | CategoryFileDescriptionMetadataMulti

export function categoryFileDescription(): CategoryFileDescription[] {}
