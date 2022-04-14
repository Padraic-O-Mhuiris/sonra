import { z } from "zod";
import { NativeCurrencyDefinitionSchema } from "./currency";

const ChainNameSchema = z.nativeEnum({
  MAINNET: "mainnet",
  // RINKEBY: "rinkeby",
  // GOERLI: "goerli",
  KOVAN: "kovan",
} as const);

export const chainName = ChainNameSchema.enum;

export const ChainIdSchema = z.nativeEnum({
  [chainName.MAINNET]: 1,
  // [chainName.RINKEBY]: 4,
  // [chainName.GOERLI]: 5,
  [chainName.KOVAN]: 42,
} as const);

export const chainId = ChainIdSchema.enum;

export type ChainName = z.infer<typeof ChainNameSchema>;
export type ChainId = z.infer<typeof ChainIdSchema>;

export const ChainDefinitionSchema = z.object({
  chainId: ChainIdSchema,
  chainName: ChainNameSchema,
  currency: NativeCurrencyDefinitionSchema,
  rpcUrls: z.array(z.string().url()).optional(),
  blockExplorerUrls: z.array(z.string().url()).optional(),
});

export type ChainDefinition = z.infer<typeof ChainDefinitionSchema>;

export const ChainDefinitionsSchema = z.record(
  ChainNameSchema,
  ChainDefinitionSchema
);

export type ChainDefinitions = z.infer<typeof ChainDefinitionsSchema>;
// import { AddEthereumChainParameter } from "@web3-react/types";
// export const ChainIdByName = {
//   mainnet: 1,
//   rinkeby: 4,
//   goerli: 5,
//   kovan: 42,
// } as const;

// type ChainIdByName = typeof ChainIdByName;

// type ChainNameById = {
//   [k in keyof ChainIdByName as ChainIdByName[k]]: k;
// };

// export type ChainName = keyof ChainIdByName;
// export type ChainId = ChainIdByName[ChainName];

// const ChainNameById: ChainNameById = Object.fromEntries(
//   Object.entries(ChainIdByName).map((a) => a.reverse())
// );

// function getChainNames(): ChainName[] {
//   return Object.keys(ChainIdByName) as ChainName[];
// }

// export const chainNames: ChainName[] = getChainNames();

// function getChainIds(): ChainId[] {
//   return Object.values(ChainIdByName) as ChainId[];
// }

// export const chainIds: ChainId[] = getChainIds();

// export function getChainIdByName(chainName: ChainName): ChainId {
//   return ChainIdByName[chainName];
// }

// export function getChainNameById(chainId: ChainId): ChainName {
//   return ChainNameById[chainId];
// }

// const ETH: AddEthereumChainParameter["nativeCurrency"] = {
//   name: "Ether",
//   symbol: "ETH",
//   decimals: 18,
// };

// const mainnetChainParameter: AddEthereumChainParameter = {
//   chainId: getChainIdByName("mainnet"),
//   chainName: "mainnet",
//   nativeCurrency: ETH,
//   rpcUrls: ["https://mainnet.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a"],
//   blockExplorerUrls: ["https://etherscan.io"],
// };

// const rinkebyChainParameter: AddEthereumChainParameter = {
//   chainId: getChainIdByName("rinkeby"),
//   chainName: "rinkeby",
//   nativeCurrency: ETH,
//   rpcUrls: ["https://rinkeby.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a"],
//   blockExplorerUrls: ["https://rinkeby.etherscan.io"],
// };

// const goerliChainParameter: AddEthereumChainParameter = {
//   chainId: getChainIdByName("goerli"),
//   chainName: "goerli",
//   nativeCurrency: ETH,
//   rpcUrls: ["https://goerli.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a"],
//   blockExplorerUrls: ["https://goerli.etherscan.io"],
// };

// const kovanChainParameter: AddEthereumChainParameter = {
//   chainId: getChainIdByName("kovan"),
//   chainName: "kovan",
//   nativeCurrency: ETH,
//   rpcUrls: ["https://kovan.infura.io/v3/7b2295eb2ca8443fba441bfd462cd93a"],
//   blockExplorerUrls: ["https://kovan.etherscan.io"],
// };

// export const chains: Record<ChainName, AddEthereumChainParameter> = {
//   mainnet: mainnetChainParameter,
//   rinkeby: rinkebyChainParameter,
//   goerli: goerliChainParameter,
//   kovan: kovanChainParameter,
// };

// type Url = string;
// type UrlMap = Record<number, Url | Url[]>;

// export const urls: UrlMap = Object.fromEntries<Url | Url[]>(
//   Object.entries(chains).map(([chainName, { rpcUrls }]) => [
//     getChainIdByName(chainName as ChainName),
//     rpcUrls,
//   ])
// );

// export const getUrlByChainName = (chainName: ChainName): string => {
//   const url = urls[getChainIdByName(chainName)];
//   return Array.isArray(url) ? url[0] : url;
// };
