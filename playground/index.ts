import { http, createPublicClient } from 'viem'
import { publicViemQuoterActions } from 'viem-quoter'
import { mainnet } from 'viem/chains'

const _publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(publicViemQuoterActions)
