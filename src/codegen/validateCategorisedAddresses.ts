import { includes } from 'lodash'
import { Address, addressCategory } from '../address'
import { SonraDataModel, SonraModel } from '../schema'
import { getRootValuesByCategory } from './buildTrie'

export function validateCategorisedAddresses(
  data: SonraDataModel<SonraModel>,
  categories: [string, ...string[]],
): Record<string, Address<string>[]> {
  const categorisedAddressesByCategory = getRootValuesByCategory(
    data,
    'CATEGORISED_ADDRESS',
  )

  for (const [category, categorisedAddresses] of Object.entries(
    categorisedAddressesByCategory,
  )) {
    for (const categorisedAddress of categorisedAddresses) {
      const [refCategory] = addressCategory(categorisedAddress)
      if (!includes(categories, refCategory)) {
        throw new Error(
          `category '${refCategory}' does not exist in your model`,
        )
      }

      if (refCategory === category) {
        throw new Error(`category '${refCategory}' references itself`)
      }
    }
  }

  return categorisedAddressesByCategory
}
