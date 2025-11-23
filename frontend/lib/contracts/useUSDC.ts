'use client';

import { useState, useCallback } from 'react';
import { useCircle } from '@/lib/circle';
import { parseUnits, formatUnits } from 'viem';
import { USDC_ABI, USDC_ADDRESS, USDC_DECIMALS } from './usdc';
import { ARC_CHAIN_ID } from './wolfBaseLendingVault';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useUSDCRead(userAddress?: `0x${string}`) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertToBigInt = (value: any): any => {
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      return BigInt(value);
    }
    if (Array.isArray(value)) {
      return value.map(item => convertToBigInt(item));
    }
    if (value !== null && typeof value === 'object') {
      const converted: any = {};
      for (const key in value) {
        converted[key] = convertToBigInt(value[key]);
      }
      return converted;
    }
    return value;
  };

  const readContract = useCallback(async <T,>(
    functionName: string,
    args?: any[]
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/wallet/contract/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName,
          args: args || [],
          chainId: ARC_CHAIN_ID,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to read contract');
      }

      const convertedData = convertToBigInt(result.data);
      return convertedData as T;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to read contract';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBalance = useCallback(async (): Promise<string> => {
    if (!userAddress) return '0';
    
    try {
      const balance = await readContract<bigint>('balanceOf', [userAddress]);
      return balance ? formatUnits(balance, USDC_DECIMALS) : '0';
    } catch (err: any) {
      console.error('Error reading USDC balance:', err);
      return '0';
    }
  }, [readContract, userAddress]);

  const getAllowance = useCallback(async (spender: `0x${string}`): Promise<string> => {
    if (!userAddress) return '0';
    
    try {
      const allowance = await readContract<bigint>('allowance', [userAddress, spender]);
      return allowance ? formatUnits(allowance, USDC_DECIMALS) : '0';
    } catch (err: any) {
      console.error('Error reading USDC allowance:', err);
      return '0';
    }
  }, [readContract, userAddress]);

  return { getBalance, getAllowance, readContract, loading, error };
}

export function useUSDCWrite() {
  const { userSession, executeChallenge } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(
    async (
      walletId: string,
      spender: `0x${string}`,
      amount: string,
      isRawAmount = false 
    ): Promise<boolean> => {
      console.log('approve called', { walletId, spender, amount, isRawAmount, hasUserSession: !!userSession });
      
      if (!userSession) {
        const error = new Error('No user session available');
        console.error(error);
        throw error;
      }

      return new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          setError(null);

          const amountInWei = isRawAmount ? BigInt(amount) : parseUnits(amount, USDC_DECIMALS);
          console.log('Amount in wei:', amountInWei.toString());

          console.log('Calling contract write API...');
          const response = await fetch(`${API_BASE_URL}/api/wallet/contract/write`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Token': userSession.userToken,
            },
            body: JSON.stringify({
              walletId,
              contractAddress: USDC_ADDRESS,
              abi: USDC_ABI,
              functionName: 'approve',
              args: [spender, amountInWei.toString()],
              value: '0',
            }),
          });

          const result = await response.json();
          console.log('API response:', result);

          if (!result.success) {
            throw new Error(result.message || 'Failed to create approval transaction');
          }

          const { challengeId } = result.data;
          console.log('Got challengeId:', challengeId);
          console.log('Executing challenge...');

          executeChallenge(challengeId, (err, challengeResult) => {
            console.log('Challenge callback', { err, challengeResult });
            
            if (err) {
              setLoading(false);
              const errorMessage = err.message || 'Approval failed';
              setError(errorMessage);
              console.error('Challenge error:', err);
              reject(err);
              return;
            }

            if (challengeResult?.status === 'COMPLETE' || challengeResult?.status === 'COMPLETED') {
              setLoading(false);
              console.log('USDC approval completed successfully');
              resolve(true);
            } else if (challengeResult?.status === 'FAILED' || challengeResult?.status === 'EXPIRED') {
              setLoading(false);
              const errorMessage = `Approval ${challengeResult.status.toLowerCase()}`;
              setError(errorMessage);
              console.error('Challenge failed/expired:', challengeResult);
              reject(new Error(errorMessage));
            } else {
              console.log('Challenge status:', challengeResult?.status);
            }
          });
        } catch (err: any) {
          setLoading(false);
          const errorMessage = err.message || 'Failed to approve USDC';
          setError(errorMessage);
          console.error('Approve error:', err);
          reject(err);
        }
      });
    },
    [userSession, executeChallenge]
  );

  const approveMax = useCallback(
    async (walletId: string, spender: `0x${string}`) => {
      console.log('approveMax called', { walletId, spender });
      // Approve maximum uint256 value for unlimited allowance
      // This is 2^256 - 1
      const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
      return approve(walletId, spender, maxUint256, true); 
    },
    [approve]
  );

  return {
    approve,
    approveMax,
    loading,
    error,
  };
}

