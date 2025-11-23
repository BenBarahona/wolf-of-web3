import { createConfig, http } from 'wagmi';
import { ARC_CHAIN } from './wolfBaseLendingVault';
import { arcChain, celoChain, worldChain } from '@/lib/bridge/chains.config';

/**
 * Wagmi configuration for reading contract data.
 * 
 * Note: This config is used ONLY for reading contract state (view functions).
 * For transactions (write operations), we use Circle's SDK directly via the
 * useCircleVaultWrite hook, which handles PIN-based transaction signing.
 * 
 */
export const wagmiConfig = createConfig({
  chains: [arcChain, celoChain, worldChain],
  connectors: [],
  transports: {
    [arcChain.id]: http(),
    [celoChain.id]: http(),
    [worldChain.id]: http(),
  },
});

