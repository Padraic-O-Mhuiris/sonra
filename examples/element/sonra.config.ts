import { ethers } from 'ethers'
import { z } from 'zod'
import { SonraCategoryModel, SonraConfig, SonraFetch, zx } from '../../src'
import {
  ERC20__factory,
  TrancheFactory__factory,
  Tranche__factory,
} from './typechain'

const provider = new ethers.providers.JsonRpcProvider(
  'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
)

const elementModel = {
  trancheFactory: z.object({}),
  baseToken: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    totalSupply: zx.bignumber(),
  }),
  principalToken: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    underlying: zx.address().category('baseToken'),
    interestToken: zx.address(),
    position: zx.address(),
    term: z.object({
      start: z.date(),
      end: z.date(),
    }),
    creator: zx.address().category('trancheFactory').or(z.null()),
  }),
} as const

const x = zx.address()
type X = z.infer<typeof x>

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

  const principalTokenAddresses = zx
    .address()
    .array()
    .nonempty()
    .parse(addressAndCreatedDateInfo.map(([address]) => address))

  const principalTokenData: SonraCategoryModel<
    ElementModel,
    'principalToken'
  >['metadata'] = {}

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
      principalToken
        .underlying()
        .then(zx.address().category('baseToken').conform().parse),
      principalToken
        .unlockTimestamp()
        .then((result) => new Date(result.toNumber() * 1000)),
      principalToken.interestToken().then(zx.address().parse),
      principalToken.position().then(zx.address().parse),
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
      creator: zx
        .address()
        .category('trancheFactory')
        .conform()
        .parse(trancheFactoryAddress),
    }
  }

  const baseTokenData: SonraCategoryModel<
    ElementModel,
    'baseToken'
  >['metadata'] = {}

  const baseTokenAddresses = zx
    .address()
    .conform()
    .array()
    .nonempty()
    .parse(
      Object.values(principalTokenData).map(({ underlying }) => underlying),
    )

  for (const baseTokenAddress of baseTokenAddresses) {
    const baseToken = ERC20__factory.connect(baseTokenAddress, provider)

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      baseToken.name(),
      baseToken.symbol(),
      baseToken.decimals(),
      baseToken.totalSupply(),
    ])

    baseTokenData[baseTokenAddress] = { name, symbol, decimals, totalSupply }
  }

  const x = {
    addresses: {
      trancheFactory: zx
        .address()
        .array()
        .nonempty()
        .parse([trancheFactoryAddress]),
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
  return x
}

const config: SonraConfig<ElementModel> = {
  dir: 'sonra-types',
  model: elementModel,
  fetch: elementFetch,
}

export default config
