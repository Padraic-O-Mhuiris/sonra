import fs from 'fs'
import path from 'path'
import { CategoryDirectoryPaths } from '../dir'
import { SonraDataModel, SonraSchema } from '../types'
import { logger } from '../utils'
import { CategoryHierarchy } from '../validations/validateCategories'
import { codegenAddressList } from './addressListCFD'
import { categoryFileDescriptions, CFDKind } from './categoryFileDescription'
import { ADDRESS_FILE_CONTENT } from './fileContent'
import { format } from './format'
import { codegenUniqueAddress } from './uniqueAddressCFD'

export async function codegen<T extends SonraSchema>(
  categories: string[],
  categoryHierarchy: CategoryHierarchy,
  categoryDirectoryPaths: CategoryDirectoryPaths,
  schema: T,
  dataModel: SonraDataModel<T>,
  outDir: string,
) {
  const cfds = categoryFileDescriptions(
    categories,
    categoryHierarchy,
    categoryDirectoryPaths,
    schema,
    dataModel,
    outDir,
  )

  logger.info(cfds, 'Category Descriptions:')

  await fs.promises.writeFile(
    path.join(outDir, 'address.ts'),
    format(ADDRESS_FILE_CONTENT),
  )

  for (const fd of cfds) {
    let file: string = ''
    switch (fd.kind) {
      case CFDKind.UNIQUE_ADDRESS:
        file = codegenUniqueAddress(fd)
        break
      case CFDKind.ADDRESS_LIST:
        file = codegenAddressList(fd)
        break
    }

    file = format(file)
    await fs.promises.writeFile(fd.paths.file, file)
  }
}
