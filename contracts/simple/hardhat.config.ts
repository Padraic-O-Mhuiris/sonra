import '@typechain/hardhat'

import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.0',
      },
    ],
  },
  typechain: {
    outDir: './types',
    target: 'ethers-v5',
    // @ts-ignore
    discriminateTypes: true, // needed
  },
}

export default config
