import { z } from 'zod'
import { randomTagAddress, SonraConfig, SonraFetch } from '../src'

const elementModel = {
  principalToken: {
    contract: 'Tranche.sol',
    meta: z.object({
      name: z.string(),
    }),
  },
} as const

type ElementModel = typeof elementModel

async function elementFetch(): SonraFetch<ElementModel> {
  return {
    addresses: {
      principalToken: [randomTagAddress('principalToken')],
    },
    contracts: {
      principalToken: 'Tranche.sol',
    },
    metadata: {
      principalToken: {
        [randomTagAddress('principalToken')]: {
          name: 'PRin',
        },
      },
    },
  }
}

export const config: SonraConfig<ElementModel> = {
  typechainDir: 'typechain', // find from hardhat.config.ts
  dir: 'sonra',
  model: elementModel,
  fetch: elementFetch,
}
