/**
 * Bridge hooks using backend Bridge Kit service
 * 
 * This uses the backend's Bridge Kit implementation which handles:
 * - CCTP bridging with external wallet (BRIDGE_WALLET_PRIVATE_KEY)
 * - Contract interactions
 * - Attestation polling
 * - Cross-chain USDC transfers
 */

import { useState, useCallback, useEffect } from 'react';
import { useCircle, useWallets } from '@/lib/circle';
import type { SupportedChainId } from './chains.config';
import {
  bridgeTransfer,
  getBridgeEstimate,
  getBridgeInfo,
  checkBridgeHealth,
  type BridgeTransferResponse,
  type BridgeEstimate,
} from './bridge-api';

export interface UseBridgeTransferResult {
  transfer: (params: {
    sourceChainId: SupportedChainId;
    destinationChainId: SupportedChainId;
    amount: string;
    recipientAddress: `0x${string}`;
  }) => Promise<void>;
  status: {
    status: 'idle' | 'pending' | 'completed' | 'failed';
    message: string;
    transactionHash?: string;
  } | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useBridgeTransfer(): UseBridgeTransferResult {
  const { userSession } = useCircle();
  const { getWallets } = useWallets();
  
  const [status, setStatus] = useState<{
    status: 'idle' | 'pending' | 'completed' | 'failed';
    message: string;
    transactionHash?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const transfer = useCallback(
    async (params: {
      sourceChainId: SupportedChainId;
      destinationChainId: SupportedChainId;
      amount: string;
      recipientAddress: `0x${string}`;
    }) => {
      if (!userSession) {
        setError(new Error('User not logged in. Please sign in with Circle wallet.'));
        return;
      }

      setIsLoading(true);
      setError(null);
      setStatus({ status: 'pending', message: 'Initiating bridge transfer...' });

      try {
        // Validate chains are different
        if (params.sourceChainId === params.destinationChainId) {
          throw new Error('Source and destination chains must be different');
        }

        // Get user's wallet
        const wallets = await getWallets();
        if (!wallets || wallets.length === 0) {
          throw new Error('No wallet found. Please create a wallet first.');
        }

        setStatus({ status: 'pending', message: 'Calling Bridge Kit service...' });

        // Call backend Bridge Kit API
        const result: BridgeTransferResponse = await bridgeTransfer({
          sourceChainId: params.sourceChainId,
          destinationChainId: params.destinationChainId,
          amount: params.amount,
          recipientAddress: params.recipientAddress,
        });

        if (result.success) {
          setStatus({
            status: 'completed',
            message: result.message,
            transactionHash: result.transactionHash,
          });
        } else {
          throw new Error(result.message);
        }

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Transfer failed');
        setError(error);
        setStatus({
          status: 'failed',
          message: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userSession, getWallets]
  );

  const reset = useCallback(() => {
    setStatus(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    transfer,
    status,
    isLoading,
    error,
    reset,
  };
}

/**
 * Hook to get bridge estimates from backend
 */
export function useBridgeEstimates(
  sourceChainId: SupportedChainId | null,
  destinationChainId: SupportedChainId | null,
  amount: string
) {
  const [estimate, setEstimate] = useState<BridgeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sourceChainId || !destinationChainId || !amount) {
      setEstimate(null);
      return;
    }

    setIsLoading(true);
    getBridgeEstimate(sourceChainId, destinationChainId, amount)
      .then(setEstimate)
      .catch((err) => {
        console.error('Failed to get bridge estimate:', err);
        setEstimate(null);
      })
      .finally(() => setIsLoading(false));
  }, [sourceChainId, destinationChainId, amount]);

  return {
    estimatedTime: estimate?.estimatedTime ?? null,
    estimatedFee: estimate?.estimatedFee ?? null,
    isLoading,
  };
}

/**
 * Hook to get bridge service info
 */
export function useBridgeInfo() {
  const [info, setInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getBridgeInfo()
      .then(setInfo)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { info, isLoading, error };
}

/**
 * Hook to check bridge health
 */
export function useBridgeHealth() {
  const [health, setHealth] = useState<any>(null);
  const [isHealthy, setIsHealthy] = useState(false);

  useEffect(() => {
    checkBridgeHealth()
      .then((data) => {
        setHealth(data);
        setIsHealthy(data.status === 'healthy');
      })
      .catch((err) => {
        console.error('Bridge health check failed:', err);
        setIsHealthy(false);
      });
  }, []);

  return { health, isHealthy };
}
