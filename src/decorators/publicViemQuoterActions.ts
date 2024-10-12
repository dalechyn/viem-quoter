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
  type GetPriceByPoolTokensAndFeeParameters as GetUniswapV3PriceByPoolTokensAndFeeParameters,
  type GetPriceByPoolTokensAndFeeReturnType as GetUniswapV3PriceByPoolTokensAndFeeReturnType,
  getPriceByPoolTokensAndFee as getUniswapV3PriceByPoolTokensAndFee,
} from '../actions/uniswap/v3/getPriceByPoolTokensAndFee.js'

export type PublicViemQuoterActions = {
  getUniswapV3EthPrice(): Promise<GetUniswapV3EthPriceReturnType>
  getUniswapV3PriceByPoolAddress(
    args: GetUniswapV3PriceByPoolAddressParameters,
  ): Promise<GetUniswapV3PriceByPoolAddressReturnType>
  getUniswapV3PriceByPoolTokensAndFee(
    args: GetUniswapV3PriceByPoolTokensAndFeeParameters,
  ): Promise<GetUniswapV3PriceByPoolTokensAndFeeReturnType>
}
export function publicViemQuoterActions<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(client: PublicClient<TTransport, TChain>): PublicViemQuoterActions {
  return {
    getUniswapV3EthPrice: () => getUniswapV3EthPrice(client),
    getUniswapV3PriceByPoolAddress: (args) =>
      getUniswapV3PriceByPoolAddress(client, args),
    getUniswapV3PriceByPoolTokensAndFee: (args) =>
      getUniswapV3PriceByPoolTokensAndFee(client, args),
  }
}
