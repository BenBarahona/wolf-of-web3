"use client";

import { useState, useCallback } from 'react';
import { useCircle } from './CircleProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Transaction {
  id: string;
  userId: string;
  transactionHash: string;
  transactionType: string;
  blockchain: string;
  contractAddress: string | null;
  status: string;
  amount: string | null;
  tokenSymbol: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  walletId: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}

export function useTransactions() {
  const { userSession } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTransactions = useCallback(
    async (limit: number = 50): Promise<Transaction[]> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/users/transactions?limit=${limit}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Token': userSession.userToken,
            },
          }
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to get transactions');
        }

        return result.data || [];
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get transactions';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userSession]
  );

  return { getTransactions, loading, error };
}

