import type { Chain, PublicClient, Transport } from 'viem'
import {
  type GetEthPriceReturnType as GetUniswapV3EthPriceReturnType,
  getEthPrice as getUniswapV3EthPrice,
} from '../actions/uniswap/v3/getEthPrice.js'

import {
  type GetPriceByPoolAddressParameters as GetUniswapV3PriceByPoolAddressParameters,
  type GetPriceByPoolAddressReturnType as GetUniswapV3PriceByPoolAddressReturnType,
  getPriceByPoolAddress as getUniswapV3PriceByPoolAddress,
} from '../actions/uniswap/v3/getPriceByPoolAddress.js'

import {
  type GetPriceParameters as GetUniswapV3PriceParameters,
  type GetPriceReturnType as GetUniswapV3PriceReturnType,
  getPrice as getUniswapV3Price,
} from '../actions/uniswap/v3/getPrice.js'

export type PublicViemQuoterActions = {
  getUniswapV3EthPrice(): Promise<GetUniswapV3EthPriceReturnType>
  getUniswapV3PriceByPoolAddress(
    args: GetUniswapV3PriceByPoolAddressParameters,
  ): Promise<GetUniswapV3PriceByPoolAddressReturnType>
  getUniswapV3Price(
    args: GetUniswapV3PriceParameters,
  ): Promise<GetUniswapV3PriceReturnType>
}
export function publicViemQuoterActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): PublicViemQuoterActions {
  return {
    getUniswapV3EthPrice: () => getUniswapV3EthPrice(client),
    getUniswapV3PriceByPoolAddress: (args) =>
      getUniswapV3PriceByPoolAddress(client, args),
    getUniswapV3Price: (args) => getUniswapV3Price(client, args),
  }
}
