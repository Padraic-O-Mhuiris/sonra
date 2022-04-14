/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TestVault, TestVaultInterface } from "../TestVault";

const _abi = [
  {
    stateMutability: "nonpayable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "pool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum TestVault.PoolSpecialization",
        name: "",
        type: "uint8",
      },
    ],
    name: "registerPool",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    name: "registerTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_pool",
        type: "address",
      },
    ],
    name: "setPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610392806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806309b2760f1461007757806316f0115b146100a05780634437152a146100b557806366a9c7d2146100ca575b3660008037600080366000346000545af18061006c573d6000803e3d6000fd5b503d6000803e3d6000f35b61008a6100853660046102e4565b6100dd565b6040516100979190610324565b60405180910390f35b6100a861012e565b6040516100979190610303565b6100c86100c3366004610259565b61014a565b005b6100c86100d836600461027a565b610191565b600080547fffffffffffffffffffffffff000000000000000000000000000000000000000016331790557f30783030000000000000000000000000000000000000000000000000000000005b919050565b60005473ffffffffffffffffffffffffffffffffffffffff1681565b600080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b505050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461012957600080fd5b600082601f8301126101ca578081fd5b8135602067ffffffffffffffff808311156101e7576101e761032d565b818302604051838282010181811084821117156102065761020661032d565b60405284815283810192508684018288018501891015610224578687fd5b8692505b8583101561024d5761023981610196565b845292840192600192909201918401610228565b50979650505050505050565b60006020828403121561026a578081fd5b61027382610196565b9392505050565b60008060006060848603121561028e578182fd5b83359250602084013567ffffffffffffffff808211156102ac578384fd5b6102b8878388016101ba565b935060408601359150808211156102cd578283fd5b506102da868287016101ba565b9150509250925092565b6000602082840312156102f5578081fd5b813560038110610273578182fd5b73ffffffffffffffffffffffffffffffffffffffff91909116815260200190565b90815260200190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fdfea2646970667358221220137d5a697189b0fd1b1728cea706b36d3a54773624d5a0becea707e6d210e1b164736f6c63430008000033";

type TestVaultConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestVaultConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestVault__factory extends ContractFactory {
  constructor(...args: TestVaultConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<TestVault> {
    return super.deploy(overrides || {}) as Promise<TestVault>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): TestVault {
    return super.attach(address) as TestVault;
  }
  connect(signer: Signer): TestVault__factory {
    return super.connect(signer) as TestVault__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestVaultInterface {
    return new utils.Interface(_abi) as TestVaultInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TestVault {
    return new Contract(address, _abi, signerOrProvider) as TestVault;
  }
}
