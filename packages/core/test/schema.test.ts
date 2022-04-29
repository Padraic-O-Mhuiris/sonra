import { ERC20__factory } from '@sonra.contracts/simple'
import { z } from 'zod'

import { createSchema } from '../src'
import { randomTagAddress } from '../src/address'
import { InferredSchema } from '../src/schema'

describe('schema', () => {
  describe('createSchema', () => {
    const schema = createSchema({
      token1: [
        ERC20__factory,
        z.object({
          name: z.literal('Token'),
          symbol: z.literal('TKN'),
          decimals: z.literal(18),
        }),
      ],
    })

    test('validates token1', () => {
      const token1Address = randomTagAddress('token1')
      const data: InferredSchema<typeof schema> = {
        categories: ['token1'],
        addresses: {
          token1: [token1Address],
        },
        contracts: {
          token1: ERC20__factory,
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
