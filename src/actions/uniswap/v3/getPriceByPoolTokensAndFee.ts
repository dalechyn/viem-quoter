import {
  type Address,
  type Client,
  encodeAbiParameters,
  getCreate2Address,
  keccak256,
} from 'viem'
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

export class GetPriceByPoolTokensAndFeeChainIsNotDefinedInClientError extends Error {}
export class GetPriceByPoolTokensAndFeeNoFactoryForChainError extends Error {}

export type GetPriceByPoolTokensAndFeeParameters = {
  tokenToQuote: Address
  otherToken: Address
  fee: 100 | 500 | 3000 | 10000
}
export type GetPriceByPoolTokensAndFeeReturnType =
  GetPriceByPoolAddressReturnType

export type GetPriceByPoolTokensAndFeeErrorType =
  | GetPriceByPoolTokensAndFeeChainIsNotDefinedInClientError
  | GetPriceByPoolTokensAndFeeNoFactoryForChainError
  | GetPriceByPoolAddressErrorType

export async function getPriceByPoolTokensAndFee(
  client: Client,
  parameters: GetPriceByPoolTokensAndFeeParameters,
): Promise<GetPriceByPoolTokensAndFeeReturnType> {
  const [token0, token1] =
    parameters.tokenToQuote > parameters.otherToken
      ? [parameters.tokenToQuote, parameters.otherToken]
      : [parameters.otherToken, parameters.tokenToQuote]
  const salt = keccak256(
    encodeAbiParameters(
      [
        { name: 'token0', type: 'address' },
        { name: 'token1', type: 'address' },
        { name: 'fee', type: 'uint24' },
      ],
      [token0, token1, parameters.fee],
    ),
  )

  if (!client.chain)
    throw new GetPriceByPoolTokensAndFeeChainIsNotDefinedInClientError()

  const factory = factories[client.chain.id]
  if (!factory) throw new GetPriceByPoolTokensAndFeeNoFactoryForChainError()

  const poolAddress = getCreate2Address({
    bytecodeHash:
      '0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54',
    salt,
    from: factory,
  })

  return getPriceByPoolAddress(client, {
    poolAddress,
    aToB: parameters.tokenToQuote === token0,
  })
}
