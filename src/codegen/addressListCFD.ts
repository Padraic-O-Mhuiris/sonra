import { logger, mkCategoryAddressType, mkCategoryFilePath } from '../utils'
import { zx } from '../zodx'
import { CFDKind, SharedCFD } from './categoryFileDescription'

export interface AddressListCFD extends SharedCFD {
  kind: CFDKind.ADDRESS_LIST
  addresses: [zx.Address, ...zx.Address[]]
}

interface IMkAddressListCFD {
  category: string
  addresses: [zx.Address, ...zx.Address[]]
  categoryDir: string
}

export const mkAddressListCFD = ({
  category,
  addresses,
  categoryDir,
}: IMkAddressListCFD): AddressListCFD => {
  logger.info(`Category kind for '${category}': ${CFDKind.ADDRESS_LIST}`)
  return {
    kind: CFDKind.ADDRESS_LIST,
    addresses,
    addressType: mkCategoryAddressType(category),
    filePath: mkCategoryFilePath(categoryDir, category),
    category,
  }
}
