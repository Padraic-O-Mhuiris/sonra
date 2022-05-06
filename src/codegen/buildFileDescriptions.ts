import { SonraDataModel, SonraModel } from '../schema'
import { validateCategories } from './validateCategories'
import { validateContracts } from './validateContracts'

interface SonraFileDescription {
  category: string
  contract: string
  contractFactory: string
  addressImports: { path: string; addressConstantLabels: string[] }[]
  addressTypeLabel: string
  addressConstantLabels: string[]
  metadataType: string
  //
  relatedAddressConstants: string[]
  isUnique: boolean
}

export function buildFileDescriptions(
  data: SonraDataModel<SonraModel>,
  contractFactories: string[],
): SonraFileDescription[] {
  const categories = validateCategories(data)
  const contractFactoriesByCategory = validateContracts(data, contractFactories)

  return []
}
