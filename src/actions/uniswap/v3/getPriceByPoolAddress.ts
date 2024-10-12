import { Decimal } from 'decimal.js'
import {
  type Address,
  type Client,
  type MulticallErrorType,
  erc20Abi,
} from 'viem'
import { multicall, readContract } from 'viem/actions'
import { LruMap } from '../../../utils/lru.js'

export class GetPriceByPoolAddressChainIsNotDefinedInClientError extends Error {}
export class GetPriceByPoolAddressMulticallFailedError extends Error {
  constructor(cause?: unknown) {
    super('Failed to multicall UniswapV3 pool', { cause })
  }
}

export type GetPriceByPoolAddressErrorType =
  | GetPriceByPoolAddressMulticallFailedError
  | GetPriceByPoolAddressChainIsNotDefinedInClientError
  | MulticallErrorType

export type GetPriceByPoolAddressParameters = {
  poolAddress: Address
  aToB: boolean
}
export type GetPriceByPoolAddressReturnType = number

const TOKEN_DECIMALS_CACHE = new LruMap<number>(8196)

export async function getPriceByPoolAddress(
  client: Client,
  parameters: GetPriceByPoolAddressParameters,
): Promise<GetPriceByPoolAddressReturnType> {
  if (!client.chain)
    throw new GetPriceByPoolAddressChainIsNotDefinedInClientError()

  const [slot0Result, token0Result, token1Result] = await multicall(client, {
    contracts: [
      {
        address: parameters.poolAddress,
        abi: [
          {
            inputs: [],
            name: 'slot0',
            outputs: [
              {
                internalType: 'uint160',
                name: 'sqrtPriceX96',
                type: 'uint160',
              },
              { internalType: 'int24', name: 'tick', type: 'int24' },
              {
                internalType: 'uint16',
                name: 'observationIndex',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'observationCardinality',
                type: 'uint16',
              },
              {
                internalType: 'uint16',
                name: 'observationCardinalityNext',
                type: 'uint16',
              },
              { internalType: 'uint8', name: 'feeProtocol', type: 'uint8' },
              { internalType: 'bool', name: 'unlocked', type: 'bool' },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'slot0',
      },
      {
        abi: [
          {
            inputs: [],
            name: 'token0',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'token0',
        address: parameters.poolAddress,
      },
      {
        abi: [
          {
            inputs: [],
            name: 'token1',
            outputs: [{ internalType: 'address', name: '', type: 'address' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],

        functionName: 'token1',
        address: parameters.poolAddress,
      },
    ] as const,
  })

  if (slot0Result.status === 'failure')
    throw new GetPriceByPoolAddressMulticallFailedError(
      slot0Result.error.message,
    )
  if (token0Result.status === 'failure')
    throw new GetPriceByPoolAddressMulticallFailedError(
      token0Result.error.message,
    )
  if (token1Result.status === 'failure')
    throw new GetPriceByPoolAddressMulticallFailedError(
      token1Result.error.message,
    )
  const [sqrtPriceX96] = slot0Result.result

  const [token0Decimals, token1Decimals] = await Promise.all(
    [token0Result.result, token1Result.result].map(async (tokenAddress) => {
      if (!client.chain)
        throw new GetPriceByPoolAddressChainIsNotDefinedInClientError()

      const tokenKey = `${tokenAddress}-${client.chain.id}`

      if (TOKEN_DECIMALS_CACHE.has(tokenKey))
        return TOKEN_DECIMALS_CACHE.get(tokenKey)!

      const decimals = await readContract(client, {
        abi: erc20Abi,
        functionName: 'decimals',
        address: tokenAddress,
      })
      TOKEN_DECIMALS_CACHE.set(tokenKey, decimals)
      return decimals
    }),
  )

  return new Decimal(1)
    [parameters.aToB ? 'mul' : 'div'](
      new Decimal((sqrtPriceX96 ** 2n).toString()).div(new Decimal(2).pow(192)),
    )
    .mul(
      new Decimal(10).pow(
        parameters.aToB
          ? token0Decimals - token1Decimals
          : token1Decimals - token0Decimals,
      ),
    )
    .toNumber()
}
