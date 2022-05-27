import { isCategorySchemaValue } from '../schema'
import { SonraSchema } from '../types'
import { logger } from '../utils'

const RESERVED_WORDS = [
  'address',
  'addresses',
  'alias',
  'aliases',
  'contract',
  'contracts',
]

type CategoryHierarchy = Record<string, string>

// The result of this function will transform an arbitrary nested schema and
// produce a non-nested object with values representing the nested path in
// dot notation e.g a.b.c will represent { a: { b: { c: <any> } }} and will
// be keyed by the deepest key in each path.
//
// The example { a: { b: { c: <any> } }} will produce:
//
// {
//   a: 'a',
//   b: 'a.b',
//   c: 'a.b.c'
// }
//
// This function will throw if two categories of the same path already exist
export function buildCategoryHierarchy(schema: SonraSchema) {
  const schemaPaths = (
    schema: SonraSchema,
    parentPath: string = '',
    prev: { [k in string]: string | undefined } = {},
  ): CategoryHierarchy => {
    return Object.entries(schema).reduce((acc, [k, v]) => {
      const currentPath = parentPath === '' ? k : `${parentPath}.${k}`
      if (prev[k] !== undefined) {
        throw new Error(
          `Category ${k} with path ${currentPath} already exists at ${prev[k]}`,
        )
      }

      const obj = { ...acc, [k]: currentPath }
      return isCategorySchemaValue(v)
        ? obj
        : { ...obj, ...schemaPaths(v, currentPath, { ...obj, ...prev }) }
    }, {} as CategoryHierarchy)
  }
  return schemaPaths(schema)
}

export function validateCategories(
  schema: SonraSchema,
): [string[], CategoryHierarchy] {
  logger.info(`Validating categories in schema:`)

  const categoryHierarchy = buildCategoryHierarchy(schema)

  logger.info(categoryHierarchy, `Schema nested paths:`)

  const categories = Object.keys(categoryHierarchy)
  if (
    !categories.every((category) => RESERVED_WORDS.every((w) => w !== category))
  ) {
    throw new Error('Specified a category which is invalid')
  }

  logger.info('Categories validated')

  return [categories, categoryHierarchy]
}
