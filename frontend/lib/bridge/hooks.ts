/**
 * React hooks for Circle Bridge Kit integration
 */

import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import {
  initiateBridgeTransfer,
  checkBridgeStatus,
  estimateTransferTime,
  estimateBridgeFee,
  type BridgeTransferParams,
  type BridgeTransferStatus,
} from './bridge.service';
import type { SupportedChainId } from './chains.config';

export interface UseBridgeTransferResult {
  transfer: (params: Omit<BridgeTransferParams, 'senderAddress'>) => Promise<void>;
  status: BridgeTransferStatus | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useBridgeTransfer(): UseBridgeTransferResult {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [status, setStatus] = useState<BridgeTransferStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const transfer = useCallback(
    async (params: Omit<BridgeTransferParams, 'senderAddress'>) => {
      if (!address) {
        setError(new Error('Wallet not connected'));
        return;
      }

      if (!walletClient) {
        setError(new Error('Wallet client not available'));
        return;
      }

      setIsLoading(true);
      setError(null);
      setStatus({ status: 'pending', message: 'Initiating transfer...' });

      try {
        const result = await initiateBridgeTransfer(
          {
            ...params,
            senderAddress: address,
          },
          walletClient as any
        );

        setStatus({
          transactionHash: result.transactionHash,
          attestationHash: result.attestationHash,
          status: 'attested',
          message: 'Transfer submitted, waiting for attestation...',
        });

        pollTransferStatus(result.attestationHash, params.destinationChainId);
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
    [address, walletClient]
  );

  const pollTransferStatus = useCallback(
    async (attestationHash: string, destinationChainId: SupportedChainId) => {
      let attempts = 0;
      const maxAttempts = 60;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setStatus({
            attestationHash,
            status: 'failed',
            message: 'Transfer status check timed out',
          });
          return;
        }

        attempts++;

        try {
          const newStatus = await checkBridgeStatus(attestationHash, destinationChainId);
          setStatus(newStatus);

          if (newStatus.status === 'completed' || newStatus.status === 'failed') {
            return;
          }

          setTimeout(poll, 30000);
        } catch (err) {
          console.error('Status poll error:', err);
          setTimeout(poll, 30000);
        }
      };

      poll();
    },
    []
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

export function useBridgeEstimates(
  sourceChainId: SupportedChainId | null,
  destinationChainId: SupportedChainId | null,
  amount: string
) {
  const estimatedTime = sourceChainId && destinationChainId
    ? estimateTransferTime(sourceChainId, destinationChainId)
    : null;

  const estimatedFee = amount ? estimateBridgeFee(amount) : null;

  return {
    estimatedTime,
    estimatedFee,
  };
}

export function useBridgeStatus(
  attestationHash: string | null,
  destinationChainId: SupportedChainId | null
) {
  const [status, setStatus] = useState<BridgeTransferStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!attestationHash || !destinationChainId) {
      return;
    }

    setIsLoading(true);

    try {
      const newStatus = await checkBridgeStatus(attestationHash, destinationChainId);
      setStatus(newStatus);
    } catch (error) {
      console.error('Status check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [attestationHash, destinationChainId]);

  return {
    status,
    isLoading,
    checkStatus,
  };
}

