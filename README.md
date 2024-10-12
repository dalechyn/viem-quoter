<p align="center">
  <a href="https://viem-quoter.vercel.app/">
  <h1>Viem Quoter</h1>
  </a>
</p>

<p align="center">
  Viem extension for quoting prices from different DEXes across all chains
<p>

<br>

## Features

- Get UniswapV3 ETH price or any other pool quote.
- Seamless extension to [Viem](https://github.com/wagmi-dev/viem)
- TypeScript ready

## Overview

```ts
import { publicViemQuoterActions } from 'viem-quoter'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
}).extend(publicViemQuoterActions)

console.log('ETH/USD Price is:', await publicClient.getUniswapV3EthPrice())

console.log(
  'WBTC/ETH Price is:',
  await publicClient.getUniswapV3Price({
    tokenToQuote: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    otherToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  }),
)
```

## Authors

- [@dalechyn](https://github.com/dalechyn) (dalechyn.eth [Twitter](https://twitter.com/dalechyn) [Warpcast](https://warpcast.com/dalechyn.eth))

## License

[MIT](LICENSE.md) License
