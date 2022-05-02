import { z } from 'zod'

import { createSonraSchema, SonraDataModel } from '../src/'
import { randomTagAddress } from '../src/address'

describe('schema', () => {
  describe('createSchema', () => {
    const model = {
      token1: [
        'ERC20',
        z.object({
          name: z.literal('Token'),
          symbol: z.literal('TKN'),
          decimals: z.literal(18),
        }),
      ],
    } as const

    const schema = createSonraSchema(model)

    test('validates token1', () => {
      const token1Address = randomTagAddress('token1')
      const data: SonraDataModel<typeof model> = {
        categories: ['token1'],
        addresses: {
          token1: [token1Address],
        },
        contracts: {
          token1: 'ERC20',
        },
        metadata: {
          token1: {
            [token1Address]: {
              name: 'Token',
              decimals: 18,
              symbol: 'TKN',
            },
          },
        },
      }
      expect(schema.parse(data)).not.toThrowError()
    })
  })
})
