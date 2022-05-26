import { ethers } from 'ethers'
import { SonraConfig, SonraFetch, zx } from '../../src'

const provider = new ethers.providers.JsonRpcProvider(
  'https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a',
)

const schema = {
  token: zx.erc20(),
} as const

type ElementSchema = typeof schema

const elementFetch: SonraFetch<ElementSchema> = async () => {
  const erc20 = {
    name: 'Token',
    symbol: 'TKN',
    decimals: 18,
  }
  return {
    token: {
      [zx.address().parse(ethers.Wallet.createRandom().address)]: erc20,
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
