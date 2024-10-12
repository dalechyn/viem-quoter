import { http, createPublicClient } from 'viem'
import { publicViemQuoterActions } from 'viem-quoter'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(publicViemQuoterActions)

console.time('ETH Price request')
// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log('ETH Price is: ', await publicClient.getUniswapV3EthPrice())
console.timeEnd('ETH Price request')

console.time('WBTC/ETH Price request')
// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log(
  'WBTC/ETH Price is:',
  await publicClient.getUniswapV3Price({
    tokenToQuote: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    otherToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  }),
)
console.timeEnd('WBTC/ETH Price request')

console.time('WBTC/ETH Price request (cached)')
// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log(
  'WBTC/ETH Price is:',
  await publicClient.getUniswapV3Price({
    tokenToQuote: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    otherToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  }),
)
console.timeEnd('WBTC/ETH Price request (cached)')
