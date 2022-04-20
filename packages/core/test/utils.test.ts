import { z } from 'zod'

import { enumMap } from '../src/utils'

describe('utils', () => {
  describe('enumMap', () => {
    const simpleEnum = z.enum(['aaa', 'bbb', 'ccc'])
    const simpleSchema = z.object({ kkk: z.literal('abcd') })
    const simpleEnumMapSchema = enumMap(simpleEnum, simpleSchema)
    const exampleObject = {
      [simpleEnum.enum.aaa]: { kkk: 'abcd' },
      [simpleEnum.enum.bbb]: { kkk: 'abcd' },
      [simpleEnum.enum.ccc]: { kkk: 'abcd' },
    }

    test('should validate true when object keys and values match schema', () => {
      expect(simpleEnumMapSchema.safeParse(exampleObject).success).toBe(true)
    })

    test('should validate false if object contains keys which do not exist in enum schema', () => {
      expect(
        simpleEnumMapSchema.safeParse({
          ...exampleObject,
          ddd: { kkk: 'abcd' },
        }).success,
      ).toBe(false)
    })

    test('should validate false if object contains values which does not match schema', () => {
      expect(
        simpleEnumMapSchema.safeParse({
          ...exampleObject,
          [simpleEnum.enum.aaa]: { kkk: 'abcde' },
        }).success,
      ).toBe(false)
    })
  })
})
