'use client';

import { useState, useCallback } from 'react';
import { useCircle } from '@/lib/circle';
import { encodeFunctionData, parseUnits, formatUnits, decodeFunctionResult } from 'viem';
import { 
  WOLF_BASE_LENDING_VAULT_ABI, 
  ARC_CHAIN_ID 
} from './wolfBaseLendingVault';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useCircleVaultRead(vaultAddress: `0x${string}`, userAddress?: `0x${string}`) {
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

      console.log(`[readContract] Calling ${functionName} with args:`, args);

      // Serialize BigInt values to strings for JSON
      const serializedArgs = (args || []).map(arg => typeof arg === 'bigint' ? arg.toString() : arg);
      console.log(`[readContract] Serialized args:`, serializedArgs);

      const response = await fetch(`${API_BASE_URL}/api/wallet/contract/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: vaultAddress,
          abi: WOLF_BASE_LENDING_VAULT_ABI,
          functionName,
          args: serializedArgs,
          chainId: ARC_CHAIN_ID,
        }),
      });

      const result = await response.json();
      console.log(`[readContract] ${functionName} API response:`, result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to read contract');
      }

      console.log(`[readContract] ${functionName} raw data:`, result.data, typeof result.data);
      const convertedData = convertToBigInt(result.data);
      console.log(`[readContract] ${functionName} converted data:`, convertedData, typeof convertedData);
      return convertedData as T;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to read contract';
      setError(errorMessage);
      console.error(`[readContract] ${functionName} error:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [vaultAddress]);

  const getVaultData = useCallback(async () => {
    try {
      console.log('[getVaultData] Reading vault data for user:', userAddress);
      
      const [totalAssets, maxTotalAssets, cooldown, userShares, userPosition] = await Promise.all([
        readContract<bigint>('totalAssets'),
        readContract<bigint>('maxTotalAssets'),
        readContract<number>('cooldown'),
        userAddress ? readContract<bigint>('balanceOf', [userAddress]) : Promise.resolve(BigInt(0)),
        userAddress ? readContract<number>('positions', [userAddress]) : Promise.resolve(0),
      ]);

      console.log('[getVaultData] Raw values:', {
        totalAssets: totalAssets?.toString(),
        maxTotalAssets: maxTotalAssets?.toString(),
        cooldown,
        userShares: userShares?.toString(),
        userPosition,
      });

      let userAssets = BigInt(0);
      if (userShares && userShares > BigInt(0)) {
        console.log('[getVaultData] User has shares, calling convertToAssets with:', userShares.toString());
        userAssets = await readContract<bigint>('convertToAssets', [userShares]) || BigInt(0);
        console.log('[getVaultData] convertToAssets returned:', userAssets.toString());
      } else {
        console.log('[getVaultData] User has no shares');
      }

      const formatted = {
        totalAssets: totalAssets ? formatUnits(totalAssets, 6) : '0',
        maxTotalAssets: maxTotalAssets ? formatUnits(maxTotalAssets, 6) : '0',
        cooldown: cooldown || 0,
        userShares: userShares ? formatUnits(userShares, 6) : '0',
        userAssets: userAssets ? formatUnits(userAssets, 6) : '0',
        lastDepositTimestamp: userPosition || 0,
      };

      console.log('[getVaultData] Formatted values:', formatted);
      
      return formatted;
    } catch (err: any) {
      console.error('Error reading vault data:', err);
      return {
        totalAssets: '0',
        maxTotalAssets: '0',
        cooldown: 0,
        userShares: '0',
        userAssets: '0',
        lastDepositTimestamp: 0,
      };
    }
  }, [readContract, userAddress]);

  return { getVaultData, readContract, loading, error };
}

export function useCircleVaultWrite(vaultAddress: `0x${string}`) {
  const { userSession, executeChallenge } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callContract = useCallback(
    async (
      walletId: string,
      functionName: string,
      args: any[],
      value: string = '0'
    ): Promise<boolean> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      return new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          setError(null);

          const serializeArgs = (args: any[]): any[] => {
            return args.map(arg => {
              if (typeof arg === 'bigint') {
                return arg.toString();
              }
              if (Array.isArray(arg)) {
                return serializeArgs(arg);
              }
              if (arg !== null && typeof arg === 'object') {
                const serialized: any = {};
                for (const key in arg) {
                  serialized[key] = typeof arg[key] === 'bigint' ? arg[key].toString() : arg[key];
                }
                return serialized;
              }
              return arg;
            });
          };

          const response = await fetch(`${API_BASE_URL}/api/wallet/contract/write`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Token': userSession.userToken,
            },
            body: JSON.stringify({
              walletId,
              contractAddress: vaultAddress,
              abi: WOLF_BASE_LENDING_VAULT_ABI,
              functionName,
              args: serializeArgs(args),
              value,
            }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Failed to create contract call');
          }

          const { challengeId } = result.data;

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
              console.log('Contract call completed successfully');
              resolve(true);
            } else if (challengeResult?.status === 'FAILED' || challengeResult?.status === 'EXPIRED') {
              setLoading(false);
              const errorMessage = `Transaction ${challengeResult.status.toLowerCase()}`;
              setError(errorMessage);
              reject(new Error(errorMessage));
            }
          });
        } catch (err: any) {
          setLoading(false);
          const errorMessage = err.message || 'Failed to call contract';
          setError(errorMessage);
          reject(err);
        }
      });
    },
    [userSession, executeChallenge, vaultAddress]
  );

  const deposit = useCallback(
    async (walletId: string, amount: string, receiver: `0x${string}`) => {
      console.log('[deposit] Starting deposit:', { amount, receiver, walletId });
      const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals
      console.log('[deposit] Amount in wei:', amountInWei.toString());
      const result = await callContract(walletId, 'deposit', [amountInWei, receiver]);
      console.log('[deposit] Deposit completed successfully');
      return result;
    },
    [callContract]
  );

  const withdraw = useCallback(
    async (walletId: string, amount: string, receiver: `0x${string}`, owner: `0x${string}`) => {
      const amountInWei = parseUnits(amount, 6);
      return callContract(walletId, 'withdraw', [amountInWei, receiver, owner]);
    },
    [callContract]
  );

  const redeem = useCallback(
    async (walletId: string, shares: string, receiver: `0x${string}`, owner: `0x${string}`) => {
      const sharesInWei = parseUnits(shares, 6); // Vault shares have 6 decimals (same as USDC)
      return callContract(walletId, 'redeem', [sharesInWei, receiver, owner]);
    },
    [callContract]
  );

  const approve = useCallback(
    async (walletId: string, spender: `0x${string}`, amount: string) => {
      // This would be for approving USDC to the vault
      const amountInWei = parseUnits(amount, 6);
      return callContract(walletId, 'approve', [spender, amountInWei]);
    },
    [callContract]
  );

  return {
    deposit,
    withdraw,
    redeem,
    approve,
    callContract,
    loading,
    error,
  };
}

