import fs from 'fs'
import path from 'path'
import { CategoryDirectoryPaths } from '../dir'
import { SonraDataModel, SonraSchema } from '../types'
import { logger } from '../utils'
import { CategoryHierarchy } from '../validations/validateCategories'
import { CategoryContractInfo } from '../validations/validateTypechain'
import { codegenAddressList } from './addressListCFD'
import { categoryFileDescriptions, CFDKind } from './categoryFileDescription'
import { ADDRESS_FILE_CONTENT } from './fileContent'
import { format } from './format'
import { codegenGenericParent } from './genericParentCFD'
import { codegenMetadataMultiAddress } from './metadataMultiAddressCFD'
import { codegenMetadataSingleAddress } from './metadataSingleAddressCFD'
import { codegenUniqueAddress } from './uniqueAddressCFD'

export async function codegen<T extends SonraSchema>(
  categories: string[],
  categoryHierarchy: CategoryHierarchy,
  categoryDirectoryPaths: CategoryDirectoryPaths,
  schema: T,
  dataModel: SonraDataModel<T>,
  categoryContractInfo: CategoryContractInfo,
  outDir: string,
) {
  const cfds = categoryFileDescriptions(
    categories,
    categoryHierarchy,
    categoryDirectoryPaths,
    schema,
    dataModel,
    categoryContractInfo,
    outDir,
  )

  logger.info(cfds, 'Category Descriptions:')

  await fs.promises.writeFile(
    path.join(outDir, 'address.ts'),
    format(ADDRESS_FILE_CONTENT),
  )

  for (const fd of Object.values(cfds)) {
    let file: string = ''
    switch (fd.kind) {
      case CFDKind.UNIQUE_ADDRESS:
        file = codegenUniqueAddress(fd)
        break
      case CFDKind.ADDRESS_LIST:
        file = codegenAddressList(fd)
        break
      case CFDKind.METADATA_SINGLE:
        file = codegenMetadataSingleAddress(fd)
        break
      case CFDKind.METADATA_MULTI:
        file = codegenMetadataMultiAddress(fd)
        break
      case CFDKind.GENERIC_PARENT:
        file = codegenGenericParent({ ...fd, cfds })
    }

    file = format(file)
    await fs.promises.writeFile(fd.paths.file, file)
  }
}
