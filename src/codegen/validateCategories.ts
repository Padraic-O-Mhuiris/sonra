import { isEqual, keys } from 'lodash'
import { SonraDataModel, SonraModel } from '../schema'
import { log } from '../utils'

/**
 * validateCategories validates that all category keys in a sonra data model are
 * all present and match each other
 * */
export function validateCategories({
  addresses,
  contracts,
  metadata,
}: SonraDataModel<SonraModel>): [string, ...string[]] {
  const addressKeys = keys(addresses)
  const contractKeys = keys(contracts)
  const metadataKeys = keys(metadata)

  if (
    !isEqual(addressKeys, contractKeys) &&
    isEqual(contractKeys, metadataKeys)
  ) {
    throw new Error('Categories are not consistent')
  }

  if (!addressKeys.length) {
    throw new Error('No categories specified')
  }

  log('Categories: %O', addressKeys)
  return addressKeys as [string, ...string[]]
}
