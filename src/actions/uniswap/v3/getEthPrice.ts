import type { Address, Client } from 'viem'
import {
  arbitrum,
  avalanche,
  base,
  blast,
  bsc,
  celo,
  mainnet,
  optimism,
  polygon,
  zksync,
} from 'viem/chains'
import {
  type GetPriceByPoolAddressErrorType,
  type GetPriceByPoolAddressReturnType,
  getPriceByPoolAddress,
} from './getPriceByPoolAddress.js'

const pools: Record<number, { address: Address; aToB: boolean } | undefined> = {
  [mainnet.id]: {
    address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
    aToB: false,
  },
  [base.id]: {
    address: '0xd0b53D9277642d899DF5C87A3966A349A798F224',
    aToB: true,
  },
  [avalanche.id]: {
    address: '0x43fb9c3fd6715e872272B0CAAB968A97692726EB',
    aToB: true,
  },
  [arbitrum.id]: {
    address: '0xC6962004f452bE9203591991D15f6b388e09E8D0',
    aToB: true,
  },
  [bsc.id]: {
    address: '0xF9878A5dD55EdC120Fde01893ea713a4f032229c',
    aToB: true,
  },
  [blast.id]: {
    address: '0xf5A23bDD36a56EDe75D503F6f643d5eaF25B1a8F',
    aToB: false,
  },
  [celo.id]: {
    address: '0xE426E1305f5e6093864762Bf9d2D8B44BC211c59',
    aToB: true,
  },
  [optimism.id]: {
    address: '0x1fb3cf6e48F1E7B10213E7b6d87D4c073C7Fdb7b',
    aToB: false,
  },
  [polygon.id]: {
    address: '0x45dDa9cb7c25131DF268515131f647d726f50608',
    aToB: false,
  },
  [zksync.id]: {
    address: '0xeEcB86c38c4667b46487255F41c6904DF3D76F8F',
    aToB: false,
  },
}

export class GetEthPriceChainIsNotDefinedInClientError extends Error {}
export class GetEthPriceNoPoolForChainError extends Error {}

export type GetEthPriceErrorType =
  | GetEthPriceNoPoolForChainError
  | GetEthPriceChainIsNotDefinedInClientError
  | GetPriceByPoolAddressErrorType

export type GetEthPriceReturnType = GetPriceByPoolAddressReturnType

export async function getEthPrice(
  client: Client,
): Promise<GetEthPriceReturnType> {
  if (!client.chain) throw new GetEthPriceChainIsNotDefinedInClientError()

  const pool = pools[client.chain.id]
  if (!pool) throw new GetEthPriceNoPoolForChainError()

  return getPriceByPoolAddress(client, {
    poolAddress: pool.address,
    aToB: pool.aToB,
  })
}
