import { ValueOf } from 'ts-essentials'
import { z } from 'zod'

import { createSchemaCategories, GenericCategories } from './category'

export const createSchemaRecord =
  <T extends GenericCategories>(...categories: T) =>
  <Z extends z.ZodTypeAny>(y: Z) => {
    const enumCategories = createSchemaCategories(...categories).enum
    const enumCategoriesArray =
      Object.values<ValueOf<typeof enumCategories>>(enumCategories)
    const enumCategoriesObj = enumCategoriesArray.reduce(
      (acc, item) => ({ ...acc, [item]: y }),
      {} as Record<ValueOf<typeof enumCategories>, Z>,
    )
    return { obj: z.object(enumCategoriesObj), enumeration: enumCategories }
  }

const { obj: x } = createSchemaRecord(
  'aaa',
  'bbb',
  'xxx',
)(
  z.object({
    yyy: z.literal(1),
  }),
)
type Y = z.infer<typeof x>
