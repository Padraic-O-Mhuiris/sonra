import { CFDKind, SharedCFD } from './categoryFileDescription'
import { zx } from '../zodx'
import { logger, mkCategoryAddressType, mkCategoryFilePath } from '../utils'

export interface UniqueAddressCFD extends SharedCFD {
  kind: CFDKind.UNIQUE_ADDRESS
  address: zx.Address
}

interface IMkUniqueAddressCFD {
  address: zx.Address
  category: string
  categoryDir: string
}

export const mkUniqueAddressCFD = ({
  address,
  category,
  categoryDir,
}: IMkUniqueAddressCFD): UniqueAddressCFD => {
  logger.info(`Category kind for '${category}': ${CFDKind.UNIQUE_ADDRESS}`)

  return {
    kind: CFDKind.UNIQUE_ADDRESS,
    address,
    addressType: mkCategoryAddressType(category),
    filePath: mkCategoryFilePath(categoryDir, category),
    category,
  }
}
