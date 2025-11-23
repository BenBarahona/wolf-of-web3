'use client';

import { http, createConfig } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains'; // o celoSepolia si usás esa
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { injected } from 'wagmi/connectors';
import { isCeloProvider } from '@/lib/walletProvider';

export const wagmiConfig = createConfig({
  chains: [celo, celoAlfajores],
  transports: {
    [celo.id]: http(),
    [celoAlfajores.id]: http(),
  },
  connectors: [
    // Sólo tiene sentido usar el conector Farcaster cuando el provider es Celo
    ...(isCeloProvider ? [farcasterMiniApp()] : []),

    // Fallback para web normal / desarrollo (Metamask, etc.)
    injected(),
  ],
});
