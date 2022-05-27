import { ethers } from 'ethers'
import { SonraConfig, SonraFetch, zx } from '../../src'

const provider = new ethers.providers.JsonRpcProvider(
  'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
)

const schema = {
  factory: zx.address(),
  token: {
    DAI: zx.erc20(),
    principalToken: {
      simplePrincipalToken: zx.erc20(),
      curvePrincipalToken: zx.erc20(),
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
  return {
    factory: address,
    token: {
      DAI: erc20,
      principalToken: {
        simplePrincipalToken: erc20,
        curvePrincipalToken: erc20,
      },
    },
  }
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
