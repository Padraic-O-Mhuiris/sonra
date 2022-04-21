import '@typechain/hardhat'

import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  paths: {
    sources: './src',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.0',
      },
    ],
  },
  typechain: {
    outDir: './dist',
    target: 'ethers-v5',
  },
}

export default config
