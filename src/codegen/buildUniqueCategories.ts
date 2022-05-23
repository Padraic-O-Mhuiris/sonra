import { SonraDataModel, SonraModel } from '../types'

export function buildUniqueCategories(
  data: SonraDataModel<SonraModel>,
): string[] {
  const uniqueCategories: string[] = []

  for (const [category, addresses] of Object.entries(data.addresses)) {
    if (addresses.length === 1) uniqueCategories.push(category)
  }
  return uniqueCategories
}
