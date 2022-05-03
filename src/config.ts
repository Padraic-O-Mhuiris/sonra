import { z } from 'zod'
import { randomTagAddress } from './address'
import { SonraDataModel, SonraModel } from './types'

export type SonraConfig<M extends SonraModel> = {
  typechainDir: string
  dir: string
  model: M
  fetch: () => Promise<SonraDataModel<M>>
}

const model = {
  principalToken: {
    contract: 'Tranche.sol',
    meta: z.object({
      name: z.string(),
    }),
  },
} as const

async function fetch(): Promise<SonraDataModel<typeof model>> {
  return {
    addresses: {
      principalToken: [randomTagAddress('principalToken')],
    },
    contracts: {
      principalToken: model.principalToken.contract,
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

export const config: SonraConfig<typeof model> = {
  typechainDir: 'typechain',
  dir: 'sonra',
  model,
  fetch,
}
