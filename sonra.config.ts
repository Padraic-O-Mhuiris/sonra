import { ethers } from 'ethers'
import { z } from 'zod'
import { createAddress } from './src/address'
import { SonraConfig } from './src/config'
import { SonraFetch } from './src/schema'
import * as zx from './src/zod'

import { TrancheFactory__factory, Tranche__factory } from './typechain'

const provider = new ethers.providers.JsonRpcProvider(
  'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
)

const elementModel = {
  principalToken: z.object({
    erc20: z.object({
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
    }),
    underlying: zx.address('baseToken'),
    interestToken: zx.address('yieldToken'),
    term: z.object({
      start: z.date(),
      end: z.date(),
    }),
    position: zx.address('wrappedPosition'),
  }),
} as const

type ElementModel = typeof elementModel

const elementFetch: SonraFetch<ElementModel> = async () => {
  const trancheFactoryAddress = '0x62F161BF3692E4015BefB05A03a94A40f520d1c0'
  const trancheFactory = TrancheFactory__factory.connect(
    trancheFactoryAddress,
    provider,
  )

  const filter = trancheFactory.filters.TrancheCreated(null, null, null)
  const trancheCreatedEvents = await trancheFactory.queryFilter(
    filter,
    14600000,
  )

  const addressAndCreatedDateInfo: [zx.Address, Date][] = await Promise.all(
    trancheCreatedEvents.map(async (event) => {
      const address = zx.address().parse(event.args.trancheAddress)
      const termStart = new Date((await event.getBlock()).timestamp * 1000)
      return [address, termStart]
    }),
  )

  console.log('Found all principalToken address creation events')
  const principalTokenAddresses = addressAndCreatedDateInfo.map(
    ([address]) => address,
  )

  const principalTokenData: {
    [k in zx.Address]: z.infer<ElementModel['principalToken']>
  } = {}

  for (const [address, termStart] of addressAndCreatedDateInfo) {
    console.log(`Finding data for principal token: ${address} :: ${termStart}`)
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
      principalToken
        .underlying()
        .then((address) => createAddress(address, 'baseToken')),
      principalToken
        .unlockTimestamp()
        .then((result) => new Date(result.toNumber() * 1000)),
      principalToken
        .interestToken()
        .then((address) => createAddress(address, 'yieldToken')),
      principalToken
        .position()
        .then((address) => createAddress(address, 'wrappedPosition')),
    ])

    principalTokenData[address] = {
      erc20: {
        name,
        symbol,
        decimals,
      },
      underlying,
      term: {
        start: termStart,
        end: termEnd,
      },
      interestToken,
      position,
    }
  }

  return {
    addresses: {
      principalToken: principalTokenAddresses,
    },
    contracts: {
      principalToken: 'Tranche.sol',
    },
    metadata: {
      principalToken: principalTokenData,
    },
  }
}

const config: SonraConfig<ElementModel> = {
  dir: 'sonra-types',
  model: elementModel,
  fetch: elementFetch,
}

export default config
