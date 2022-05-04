import { isEqual, keys } from 'lodash'
import { SonraDataModel, SonraModel } from '../schema'

export function validateCategories({
  addresses,
  contracts,
  metadata,
}: SonraDataModel<SonraModel>): [string, ...string[]] | null {
  const addressKeys = keys(addresses)
  const contractKeys = keys(contracts)
  const metadataKeys = keys(metadata)

  if (
    !isEqual(addressKeys, contractKeys) &&
    isEqual(contractKeys, metadataKeys)
  ) {
    console.log('Categories are not consistent')
    return null
  }

  if (!addressKeys.length) {
    console.log('No categories specified')
    return null
  }
  return addressKeys as [string, ...string[]]
}
