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

console.log(await publicClient.getUniswapV3EthPrice())
```

## Authors

- [@dalechyn](https://github.com/dalechyn) (dalechyn.eth [Twitter](https://twitter.com/dalechyn) [Warpcast](https://warpcast.com/dalechyn.eth))

## License

[MIT](LICENSE.md) License
