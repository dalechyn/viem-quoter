import { http, createPublicClient } from 'viem'
import { publicViemQuoterActions } from 'viem-quoter'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(publicViemQuoterActions)

// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log('ETH Price is: ', await publicClient.getUniswapV3EthPrice())
