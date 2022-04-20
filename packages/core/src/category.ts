import { z } from 'zod'

export type GenericCategories = [string, ...string[]]

export const createSchemaCategories = <T extends GenericCategories>(...x: T) =>
  z.enum(x)
