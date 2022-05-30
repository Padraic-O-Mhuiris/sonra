import { ethers } from 'ethers'
import { SonraConfig, SonraFetch, zx } from '../../src'

// const provider = new ethers.providers.JsonRpcProvider(
//   'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
// )

const schema = {
  factory: zx.address(),
  token: {
    baseToken: {
      DAI: zx.erc20(),
      curveLpToken: {
        LUSD_3CRV: zx.erc20(),
      },
    },
    principalToken: {
      simplePrincipalToken: zx.erc20(),
      curvePrincipalToken: zx.erc20().extend({
        underlying: zx.address().category('curveLpToken'),
      }),
    },
  },
} as const

type ElementSchema = typeof schema

const elementFetch: SonraFetch<ElementSchema> = async () => {
  const erc20 = {
    name: 'Token',
    symbol: 'TKN',
    decimals: 18,
  }
  const address = zx.address().parse(ethers.Wallet.createRandom().address)

  const erc20AddressRec = { [address]: erc20 }
  const x = {
    factory: address,
    token: {
      baseToken: {
        DAI: erc20AddressRec,
        curveLpToken: {
          LUSD_3CRV: erc20AddressRec,
        },
      },
      principalToken: {
        simplePrincipalToken: erc20AddressRec,
        curvePrincipalToken: {
          [address]: {
            ...erc20,
            underlying: zx
              .address()
              .category('curveLpToken')
              .conform()
              .parse(address),
          },
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
