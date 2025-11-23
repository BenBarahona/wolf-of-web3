"use client";

import { useState, useCallback } from 'react';
import { useCircle } from './CircleProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ContractTransactionParams {
  walletId: string;
  contractAddress: string;
  abiFunctionSignature: string;
  abiParameters: any[];
  amount?: string;
  feeLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function useContractTransaction() {
  const { userSession, executeChallenge } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeContractTransaction = useCallback(
    async (params: ContractTransactionParams): Promise<{ transactionId: string; transactionHash?: string }> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      return new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          setError(null);

          const serializedParams = {
            ...params,
            abiParameters: params.abiParameters.map(param => {
              if (typeof param === 'bigint') {
                return param.toString();
              }
              return param;
            }),
          };

          const response = await fetch(`${API_BASE_URL}/api/wallet/transaction/contract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Token': userSession.userToken,
            },
            body: JSON.stringify(serializedParams),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Failed to create contract transaction');
          }

          const { challengeId, transactionId } = result.data;

          executeChallenge(challengeId, (err, challengeResult) => {
            if (err) {
              setLoading(false);
              const errorMessage = err.message || 'Transaction failed';
              setError(errorMessage);
              reject(err);
              return;
            }

            if (challengeResult?.status === 'COMPLETE' || challengeResult?.status === 'COMPLETED') {
              setLoading(false);
              const txHash = challengeResult.data?.transactionHash || transactionId;
              console.log(`Contract transaction completed successfully - Hash: ${txHash}`);
              resolve({
                transactionId,
                transactionHash: txHash,
              });
            } else if (challengeResult?.status === 'FAILED' || challengeResult?.status === 'EXPIRED') {
              setLoading(false);
              const errorMessage = `Transaction ${challengeResult.status.toLowerCase()}`;
              setError(errorMessage);
              reject(new Error(errorMessage));
            } else if (challengeResult?.status === 'IN_PROGRESS' || challengeResult?.status === 'PENDING') {
              console.log(`Transaction status: ${challengeResult.status}`);
            }
          });
        } catch (err: any) {
          setLoading(false);
          const errorMessage = err.message || 'Failed to execute contract transaction';
          setError(errorMessage);
          reject(err);
        }
      });
    },
    [userSession, executeChallenge]
  );

  return { executeContractTransaction, loading, error };
}

