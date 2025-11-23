import { createConfig, http } from 'wagmi';
import { ARC_CHAIN } from './wolfBaseLendingVault';

/**
 * Wagmi configuration for reading contract data.
 * 
 * Note: This config is used ONLY for reading contract state (view functions).
 * For transactions (write operations), we use Circle's SDK directly via the
 * useCircleVaultWrite hook, which handles PIN-based transaction signing.
 */
export const wagmiConfig = createConfig({
  chains: [ARC_CHAIN],
  connectors: [], // No wallet connectors needed - Circle SDK handles transactions
  transports: {
    [ARC_CHAIN.id]: http(),
  },
});

