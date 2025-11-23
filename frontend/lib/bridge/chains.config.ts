/**
 * Multi-chain configuration for Wolf of Web3
 * Includes Arc, Celo, and World chains with vault and USDC addresses
 */

import { type Chain } from 'viem';

// Arc L2 Testnet Configuration
export const arcChain = {
  id: 5042002,
  name: 'Arc L2 Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://arc-testnet.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g'],
    },
    public: {
      http: ['https://arc-testnet.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Explorer',
      url: 'https://explorer.testnet.arc.network',
    },
  },
  testnet: true,
} as const satisfies Chain;

export const celoChain = {
  id: 11155111,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://celo-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g'],
    },
    public: {
      http: ['https://celo-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CeloScan',
      url: 'https://sepolia.celoscan.io',
    },
  },
  testnet: true,
} as const satisfies Chain;

export const worldChain = {
  id: 4801,
  name: 'World Chain Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://worldchain-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g'],
    },
    public: {
      http: ['https://worldchain-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g'],
    },
  },
  blockExplorers: {
    default: {
      name: 'World Explorer',
      url: 'https://sepolia.worldscan.org',
    },
  },
  testnet: true,
} as const satisfies Chain;

export const SUPPORTED_CHAINS = [arcChain, celoChain, worldChain] as const;

export type SupportedChainId = typeof SUPPORTED_CHAINS[number]['id'];

export const USDC_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  [arcChain.id]: '0x3600000000000000000000000000000000000000',
  [celoChain.id]: '0x01C5C0122039549AD1493B8220cABEdD739BC44E',
  [worldChain.id]: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88',
};

export const VAULT_ADDRESSES = {
  // Arc: Low Risk Lending Vault
  [arcChain.id]: {
    name: 'Wolf Low Risk Lending Vault',
    symbol: 'wLEND-ARC',
    address: (process.env.NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    riskLevel: 'low' as const,
    description: 'Low-risk lending strategy on Arc with stable yields',
  },
  // Celo: Medium Risk Staking Vault
  [celoChain.id]: {
    name: 'Wolf Medium Risk Staking Vault',
    symbol: 'wSTAKE-CELO',
    address: '0x56C4c8dbb6E9598b90119686c40271a969e1eE44' as `0x${string}`,
    riskLevel: 'medium' as const,
    description: 'Medium-risk staking strategy on Celo',
  },
  // World: High Risk Meme Index Vault
  [worldChain.id]: {
    name: 'Wolf High Risk Meme Index Vault',
    symbol: 'wMEME-WORLD',
    address: '0x56C4c8dbb6E9598b90119686c40271a969e1eE44' as `0x${string}`,
    riskLevel: 'high' as const,
    description: 'High-risk meme coin index on World Chain',
  },
} as const;

export function getChainById(chainId: number): Chain | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
}

export function getUSDCAddress(chainId: SupportedChainId): `0x${string}` {
  return USDC_ADDRESSES[chainId];
}

export function getVaultInfo(chainId: SupportedChainId) {
  return VAULT_ADDRESSES[chainId];
}

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return (SUPPORTED_CHAINS as readonly Chain[]).some((chain) => chain.id === chainId);
}

export function getChainName(chainId: number): string {
  const chain = getChainById(chainId);
  return chain?.name || 'Unknown Chain';
}

export const RISK_LEVEL_COLORS = {
  low: {
    bg: 'bg-green-900/30',
    border: 'border-green-600',
    text: 'text-green-400',
  },
  medium: {
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-600',
    text: 'text-yellow-400',
  },
  high: {
    bg: 'bg-red-900/30',
    border: 'border-red-600',
    text: 'text-red-400',
  },
} as const;

