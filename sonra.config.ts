import { ethers } from 'ethers'
import { z } from 'zod'
import { createAddress } from './src/address'
import { SonraConfig } from './src/config'
import { SonraFetch } from './src/schema'
import * as zx from './src/zod'
import {
  ERC20__factory,
  TrancheFactory__factory,
  Tranche__factory,
} from './typechain'
import { log } from './src/utils'

const provider = new ethers.providers.JsonRpcProvider(
  'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
)

const elementModel = {
  baseToken: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }),
  principalToken: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    underlying: zx.address('baseToken'),
    interestToken: zx.address(),
    position: zx.address(),
    term: z.object({
      start: z.date(),
      end: z.date(),
    }),
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
    14650000,
  )

  const addressAndCreatedDateInfo: [zx.Address, Date][] = await Promise.all(
    trancheCreatedEvents.map(async (event) => {
      const address = zx.address().parse(event.args.trancheAddress)
      const termStart = new Date((await event.getBlock()).timestamp * 1000)
      return [address, termStart]
    }),
  )

  log('Found all principalToken address creation events')
  const principalTokenAddresses = addressAndCreatedDateInfo.map(
    ([address]) => address,
  )

  const principalTokenData: {
    [k in zx.Address]: z.infer<ElementModel['principalToken']>
  } = {}

  for (const [address, termStart] of addressAndCreatedDateInfo) {
    log(`Finding data for principal token: ${address} :: ${termStart}`)
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
      principalToken.interestToken().then((address) => createAddress(address)),
      principalToken.position().then((address) => createAddress(address)),
    ])

    principalTokenData[address] = {
      name,
      symbol,
      decimals,
      underlying,
      term: {
        start: termStart,
        end: termEnd,
      },
      interestToken,
      position,
    }
  }

  const baseTokenData: {
    [k in zx.Address]: z.infer<ElementModel['baseToken']>
  } = {}

  const baseTokenAddresses = Object.entries(principalTokenData).map(
    ([, { underlying }]) => zx.address().parse(underlying.split(':')[1]),
  )

  for (const baseTokenAddress of baseTokenAddresses) {
    log(`Finding data for base token: ${baseTokenAddress}`)
    const baseToken = ERC20__factory.connect(baseTokenAddress, provider)

    const [name, symbol, decimals] = await Promise.all([
      baseToken.name(),
      baseToken.symbol(),
      baseToken.decimals(),
    ])

    baseTokenData[baseTokenAddress] = { name, symbol, decimals }
  }

  return {
    addresses: {
      baseToken: baseTokenAddresses,
      principalToken: principalTokenAddresses,
    },
    contracts: {
      baseToken: 'ERC20.sol',
      principalToken: 'Tranche.sol',
    },
    metadata: {
      baseToken: baseTokenData,
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
