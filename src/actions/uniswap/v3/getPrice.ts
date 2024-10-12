import {
  type Address,
  type Client,
  encodeAbiParameters,
  getCreate2Address,
  keccak256,
} from 'viem'
import { getCode } from 'viem/actions'
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  base,
  baseSepolia,
  blast,
  bsc,
  celo,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
  zksync,
  zora,
  zoraSepolia,
} from 'viem/chains'
import { LruMap } from '../../../utils/lru.js'
import {
  type GetPriceByPoolAddressErrorType,
  type GetPriceByPoolAddressReturnType,
  getPriceByPoolAddress,
} from './getPriceByPoolAddress.js'

const factories: Record<number, Address | undefined> = {
  [avalanche.id]: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
  [arbitrum.id]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [arbitrumSepolia.id]: '0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e',
  [bsc.id]: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
  [base.id]: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  [baseSepolia.id]: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  [blast.id]: '0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd',
  [celo.id]: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
  [mainnet.id]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [sepolia.id]: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
  [optimism.id]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [optimismSepolia.id]: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
  [polygon.id]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [polygonMumbai.id]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [zksync.id]: '0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422',
  [zora.id]: '0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb',
  [zoraSepolia.id]: '0x4324A677D74764f46f33ED447964252441aA8Db6',
}

export class GetPriceChainIsNotDefinedInClientError extends Error {}
export class GetPriceNoPoolExistsError extends Error {}
export class GetPriceNoFactoryForChainError extends Error {}

type Fee = 100 | 500 | 3000 | 10000

export type GetPriceParameters = {
  tokenToQuote: Address
  otherToken: Address
  fee?: Fee
}
export type GetPriceReturnType = GetPriceByPoolAddressReturnType

export type GetPriceErrorType =
  | GetPriceChainIsNotDefinedInClientError
  | GetPriceNoFactoryForChainError
  | GetPriceNoPoolExistsError
  | GetPriceByPoolAddressErrorType

function getSalt(token0: Address, token1: Address, fee: number) {
  return keccak256(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }, { type: 'uint24' }],
      [token0, token1, fee],
    ),
  )
}

const BYTECODE_HASH =
  '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54'

const UNSPECIFIED_FEE_CACHE = new LruMap<Fee>(8196)

export async function getPrice(
  client: Client,
  parameters: GetPriceParameters,
): Promise<GetPriceReturnType> {
  if (!client.chain) throw new GetPriceChainIsNotDefinedInClientError()

  const factory = factories[client.chain.id]
  if (!factory) throw new GetPriceNoFactoryForChainError()

  const [token0, token1] =
    parameters.tokenToQuote > parameters.otherToken
      ? [parameters.otherToken, parameters.tokenToQuote]
      : [parameters.tokenToQuote, parameters.otherToken]

  const fee =
    parameters.fee ??
    (await (async () => {
      const cacheKey = `${token0}-${token1}`
      if (UNSPECIFIED_FEE_CACHE.has(cacheKey))
        return UNSPECIFIED_FEE_CACHE.get(cacheKey)!
      // Start looking for existing pools from top to bottom.
      //
      // Shouldn't really matter for quoting purposes which fee to chose
      // since MEV bots would always even the price across all of them.
      for (const possibleFee of [100, 500, 3000, 10000] as const) {
        const salt = getSalt(token0, token1, possibleFee)
        const poolAddress = getCreate2Address({
          bytecodeHash: BYTECODE_HASH,
          salt,
          from: factory,
        })
        const code = await getCode(client, { address: poolAddress })
        if (typeof code === 'undefined') continue

        UNSPECIFIED_FEE_CACHE.set(cacheKey, possibleFee)
        return possibleFee
      }
      throw new GetPriceNoPoolExistsError()
    })())

  const salt = keccak256(
    encodeAbiParameters(
      [{ type: 'address' }, { type: 'address' }, { type: 'uint24' }],
      [token0, token1, fee],
    ),
  )

  const poolAddress = getCreate2Address({
    bytecodeHash: BYTECODE_HASH,
    salt,
    from: factory,
  })

  return getPriceByPoolAddress(client, {
    poolAddress,
    aToB: parameters.tokenToQuote === token0,
  })
}
