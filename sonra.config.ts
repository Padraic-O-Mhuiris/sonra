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
  trancheFactory: z.object({}),
  baseToken: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    totalSupply: zx.bigNumber(),
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
    creator: zx.address('trancheFactory'),
  }),
} as const

type ElementModel = typeof elementModel

const elementFetch: SonraFetch<ElementModel> = async () => {
  const trancheFactoryAddress = zx
    .address()
    .parse('0x62F161BF3692E4015BefB05A03a94A40f520d1c0')
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

  log('Found all principalToken address creation events')
  const principalTokenAddresses = zx
    .addressArray()
    .parse(addressAndCreatedDateInfo.map(([address]) => address))

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
      creator: createAddress(trancheFactoryAddress, 'trancheFactory'),
    }
  }

  const baseTokenData: {
    [k in zx.Address]: z.infer<ElementModel['baseToken']>
  } = {}

  const baseTokenAddresses = zx
    .addressArray()
    .parse(
      Object.entries(principalTokenData).map(([, { underlying }]) =>
        zx.address().parse(underlying.split(':')[1]),
      ),
    )

  for (const baseTokenAddress of baseTokenAddresses) {
    log(`Finding data for base token: ${baseTokenAddress}`)
    const baseToken = ERC20__factory.connect(baseTokenAddress, provider)

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      baseToken.name(),
      baseToken.symbol(),
      baseToken.decimals(),
      baseToken.totalSupply(),
    ])

    baseTokenData[baseTokenAddress] = { name, symbol, decimals, totalSupply }
  }

  return {
    addresses: {
      trancheFactory: [trancheFactoryAddress],
      baseToken: baseTokenAddresses,
      principalToken: principalTokenAddresses,
    },
    contracts: {
      trancheFactory: 'TrancheFactory.sol',
      baseToken: 'ERC20.sol',
      principalToken: 'Tranche.sol',
    },
    metadata: {
      trancheFactory: {},
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
