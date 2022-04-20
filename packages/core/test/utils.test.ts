import { z } from 'zod'

import { enumKeyedObject } from '../src/utils'

describe('utils', () => {
  describe('enumKeyedObject', () => {
    const simpleEnum = z.enum(['aaa', 'bbb', 'ccc'])
    const simpleSchema = z.object({ kkk: z.literal('abcd') })
    const simpleEnumKeyedSchema = enumKeyedObject(simpleEnum, simpleSchema)
    const exampleObject = {
      [simpleEnum.enum.aaa]: { kkk: 'abcd' },
      [simpleEnum.enum.bbb]: { kkk: 'abcd' },
      [simpleEnum.enum.ccc]: { kkk: 'abcd' },
    }

    test('should validate true when object keys and values match schema', () => {
      expect(simpleEnumKeyedSchema.safeParse(exampleObject).success).toBe(true)
    })

    test('should validate false if object contains keys which do not exist in enum schema', () => {
      expect(
        simpleEnumKeyedSchema.safeParse({
          ...exampleObject,
          ddd: { kkk: 'abcd' },
        }).success,
      ).toBe(false)
    })

    test('should validate false if object contains values which does not match schema', () => {
      expect(
        simpleEnumKeyedSchema.safeParse({
          ...exampleObject,
          [simpleEnum.enum.aaa]: { kkk: 'abcde' },
        }).success,
      ).toBe(false)
    })
  })
})
