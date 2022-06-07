import { SonraConfig, SonraFetch, z, zx } from '../../src'
import { SonraDataModel } from '../../src/types'

// const provider = new ethers.providers.JsonRpcProvider(
//   'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
// )

const schema = {
  trancheFactory: zx.address(),
  ccPoolFactory: zx.address().array().nonempty(),
  token: {
    baseToken: {
      DAI: zx.erc20(),
      curveLpToken: zx.erc20(),
    },
    principalToken: {
      simplePrincipalToken: zx.erc20(),
      curvePrincipalToken: zx.erc20().extend({
        underlying: zx.address().category('curveLpToken'),
        date: z.date(),
      }),
    },
  },
  otherToken: {
    daiRef: z.object({
      ref: zx.address().category('DAI'),
    }),
    lusd3CrvRef: z.object({
      ref: zx.address().category('curveLpToken'),
    }),
    threeCrvRef: z.object({
      ref: zx.address().category('curveLpToken'),
    }),
  },
} as const

type ElementSchema = typeof schema

const elementFetch: SonraFetch<ElementSchema> = async () => {
  const erc20 = {
    name: 'Token',
    symbol: 'TKN',
    decimals: 18,
  }

  const randomERC20Entry = () => ({ [zx.address().random()]: erc20 })

  const DAIAddress = zx.address().random()
  const LUSD_3CRVAddress = zx.address().random()
  const THREE_CRVAddress = zx.address().random()

  const x: SonraDataModel<ElementSchema> = {
    trancheFactory: zx.address().random(),
    ccPoolFactory: zx
      .address()
      .array()
      .nonempty()
      .parse([zx.address().random(), zx.address().random()]),
    token: {
      baseToken: {
        DAI: { [DAIAddress]: erc20 },
        curveLpToken: {
          [LUSD_3CRVAddress]: erc20,
          [THREE_CRVAddress]: erc20,
        },
      },
      principalToken: {
        simplePrincipalToken: {
          ...randomERC20Entry(),
          ...randomERC20Entry(),
        },
        curvePrincipalToken: {
          [zx.address().random()]: {
            ...erc20,
            underlying: zx
              .address()
              .category('curveLpToken')
              .conform()
              .parse(LUSD_3CRVAddress),
            date: new Date(1111111),
          },
          [zx.address().random()]: {
            ...erc20,
            underlying: zx
              .address()
              .category('curveLpToken')
              .conform()
              .parse(THREE_CRVAddress),
            date: new Date(1111111),
          },
        },
      },
    },
    otherToken: {
      daiRef: {
        [zx.address().random()]: {
          ref: zx.address().category('DAI').conform().parse(DAIAddress),
        },
      },
      lusd3CrvRef: {
        [zx.address().random()]: {
          ref: zx
            .address()
            .category('curveLpToken')
            .conform()
            .parse(LUSD_3CRVAddress),
        },
      },
      threeCrvRef: {
        [zx.address().random()]: {
          ref: zx
            .address()
            .category('curveLpToken')
            .conform()
            .parse(THREE_CRVAddress),
        },
      },
    },
  }

  return x
}

const config: SonraConfig<ElementSchema> = {
  outDir: 'sonra-types',
  schema,
  contracts: {
    token: 'ERC20.sol',
  },
  fetch: elementFetch,
}

export default config
