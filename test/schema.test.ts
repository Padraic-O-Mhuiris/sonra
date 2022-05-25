import { z } from 'zod'
import { zx } from '../src'
import { genDataModelSchema } from '../src/schema2'
import { SonraDataModel } from '../src/types2'
import { randomAddress } from './utils'

const schema = {
  AAA: {
    BBB: z.object({
      bbb: z.literal('2'),
    }),
    CCC: {
      DDD: zx.address().array().nonempty(),
    },
  },
  XXX: {
    UUU: zx.address(),
    ZZZ: {
      XXX: z.object({
        rrr: z.literal(5),
      }),
    },
  },
} as const

type Schema = typeof schema

describe('genDataModelSchema()', () => {
  const dataModelSchema = genDataModelSchema(schema)
  const inputData: SonraDataModel<Schema> = {
    AAA: {
      BBB: {
        [randomAddress()]: {
          bbb: '2',
        },
      },
      CCC: {
        DDD: [randomAddress()],
      },
    },
    XXX: {
      UUU: randomAddress(),
      ZZZ: {
        XXX: { [randomAddress()]: { rrr: 5 } },
      },
    },
  }

  test('should produce a single large z.ZodObject', () => {
    expect(dataModelSchema._def.typeName).toBe(
      z.ZodFirstPartyTypeKind.ZodObject,
    )
  })

  test('should validate correctly', () => {
    expect(dataModelSchema.safeParse(inputData).success).toBe(true)
    expect(dataModelSchema.safeParse({ ...inputData, rrr: 2 }).success).toBe(
      false,
    )
    expect(
      dataModelSchema.safeParse({
        ...inputData,
        AAA: { BBB: { [randomAddress()]: { aaa: '2' } } },
      }).success,
    ).toBe(false)
  })
})
