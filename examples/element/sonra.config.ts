import {
  Address,
  addressSchema,
  SonraConfig,
  SonraDataModel,
} from '@sonra/core'
import { ethers } from 'ethers'
import { z } from 'zod'
import { TrancheFactory__factory, Tranche__factory } from './typechain'

const model = {
  principalToken: {
    contract: 'Tranche.sol',
    meta: z.object({
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
      underlying: addressSchema,
      interestToken: addressSchema,
      termStart: z.date(),
      termEnd: z.date(),
      position: addressSchema,
    }),
  },
} as const

const provider = new ethers.providers.JsonRpcProvider(
  'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
)

async function fetch(): Promise<SonraDataModel<typeof model>> {
  const trancheFactory = TrancheFactory__factory.connect(
    '0x62F161BF3692E4015BefB05A03a94A40f520d1c0',
    provider,
  )

  const filter = trancheFactory.filters.TrancheCreated(null, null, null)
  const trancheCreatedEvents = await trancheFactory.queryFilter(filter)

  const addressAndCreatedDateInfo: [Address, Date][] = await Promise.all(
    trancheCreatedEvents.map(async (event) => {
      const address = addressSchema.parse(event.args.trancheAddress)
      const termStart = new Date((await event.getBlock()).timestamp * 1000)
      return [address, termStart]
    }),
  )

  const principalTokenAddresses = addressAndCreatedDateInfo.map(
    ([address]) => address,
  )

  const x = z.object({ x: z.literal(1), b: z.literal('111') })

  type U = z.infer<typeof x>
  let principalTokenData: {
    [k in Address]: z.infer<typeof model.principalToken.meta>
  } = {}

  for (const [address, termStart] of addressAndCreatedDateInfo) {
    const principalToken = Tranche__factory.connect(address, provider)

    const [
      name,
      symbol,
      decimals,
      underlying,
      termEnd,
      interestToken,
      position,
    ] = await Promise.all([
      principalToken.name(),
      principalToken.symbol(),
      principalToken.decimals(),
      principalToken.underlying().then(addressSchema.parse),
      principalToken
        .unlockTimestamp()
        .then((result) => new Date(result.toNumber() * 1000)),
      principalToken.interestToken().then(addressSchema.parse),
      principalToken.position().then(addressSchema.parse),
    ])

    principalTokenData[address] = {
      name,
      symbol,
      decimals,
      underlying,
      termStart,
      termEnd,
      interestToken,
      position,
    }
  }

  const categories = ['principalToken'] as ['principalToken']
  return {
    categories,
    addresses: {
      principalToken: principalTokenAddresses,
    },
    contracts: {
      principalToken: model.principalToken.contract,
    },
    metadata: {
      principalToken: principalTokenData,
    },
  }
}

const config: SonraConfig<typeof model> = {
  typechainDir: 'typechain',
  dir: 'sonra',
  model,
  fetch,
}

export default config
