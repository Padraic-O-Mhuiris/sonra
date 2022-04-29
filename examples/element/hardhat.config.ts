import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "@typechain/ethers-v5";
import "tsconfig-paths/register";

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  typechain: {
    outDir: "typechain/",
    target: "ethers-v5",
    alwaysGenerateOverloads: true,
    externalArtifacts: ["externalArtifacts/*.json"],
  },
  solidity: {
    compilers: [
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 7500,
          },
        },
      },
    ],
    overrides: {
      "contracts/balancer-core-v2/vault/Vault.sol": {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 400,
          },
        },
      },
      "contracts/balancer-core-v2/pools/weighted/WeightedPoolFactory.sol": {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
      "contracts/balancer-core-v2/pools/weighted/WeightedPool2TokensFactory.sol":
        {
          version: "0.7.1",
          settings: {
            optimizer: {
              enabled: true,
              runs: 800,
            },
          },
        },
    },
  },
};

export default config;
