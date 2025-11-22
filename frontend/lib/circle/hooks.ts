'use client';

import { useState, useCallback } from 'react';
import { useCircle } from './CircleProvider';
import * as circleApi from './api';
import type { WalletInfo, UserStatus, Balance } from './types';

/**
 * Helper function to handle Circle SDK challenge status updates
 * The SDK calls the callback multiple times with different statuses
 */
function handleChallengeStatus(
  result: any,
  operationName: string,
  callbacks: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resolve: (value: boolean) => void;
    reject: (error: Error) => void;
  }
) {
  const { setLoading, setError, resolve, reject } = callbacks;

  // Handle success statuses (both COMPLETE and COMPLETED)
  if (result?.status === 'COMPLETE' || result?.status === 'COMPLETED') {
    setLoading(false);
    console.log(`${operationName} completed successfully`);
    resolve(true);
  } else if (result?.status === 'FAILED' || result?.status === 'EXPIRED') {
    setLoading(false);
    const errorMessage = `${operationName} ${result.status.toLowerCase()}`;
    setError(errorMessage);
    reject(new Error(errorMessage));
  } else if (result?.status === 'IN_PROGRESS' || result?.status === 'PENDING') {
    // Don't resolve or reject yet - wait for final status
    console.log(`${operationName} status: ${result.status}`);
  } else {
    // Unknown status - log it for debugging
    setLoading(false);
    const errorMessage = `Unknown ${operationName.toLowerCase()} status: ${result?.status}`;
    console.error(errorMessage, result);
    setError(errorMessage);
    reject(new Error(errorMessage));
  }
}

export function useCreateUser() {
  const { setUserSession, executeChallenge } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(
    async (userId?: string, email?: string, username?: string) => {
      try {
        setLoading(true);
        setError(null);

        const userData = await circleApi.createUser(userId, email, username);

        setUserSession(userData);

        return userData;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setUserSession]
  );

  return { createUser, loading, error };
}

export function useSetupPIN() {
  const { userSession, executeChallenge } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupPIN = useCallback(
    async (): Promise<boolean> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      return new Promise((resolve, reject) => {
        try {
          setLoading(true);
          setError(null);

          executeChallenge(userSession.challengeId, (err, result) => {
            if (err) {
              setLoading(false);
              const errorMessage = err.message || 'Failed to setup PIN';
              setError(errorMessage);
              reject(err);
              return;
            }

            handleChallengeStatus(result, 'PIN setup', {
              setLoading,
              setError,
              resolve,
              reject,
            });
          });
        } catch (err: any) {
          setLoading(false);
          const errorMessage = err.message || 'Failed to setup PIN';
          setError(errorMessage);
          reject(err);
        }
      });
    },
    [userSession, executeChallenge]
  );

  return { setupPIN, loading, error };
}

export function useCreateWallet() {
  const { userSession } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWallet = useCallback(
    async (blockchain: string = 'ARC-TESTNET', accountType: 'SCA' | 'EOA' = 'SCA'): Promise<WalletInfo> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      try {
        setLoading(true);
        setError(null);

        // Create wallet - PIN should already be set up at this point
        const wallet = await circleApi.createWallet(
          userSession.userToken,
          blockchain,
          accountType
        );

        return wallet;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create wallet';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userSession]
  );

  return { createWallet, loading, error };
}

export function useUserStatus() {
  const { userSession } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserStatus = useCallback(async (): Promise<UserStatus> => {
    if (!userSession) {
      throw new Error('No user session available');
    }

    try {
      setLoading(true);
      setError(null);

      const status = await circleApi.getUserStatus(userSession.userToken);
      return status;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get user status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userSession]);

  return { getUserStatus, loading, error };
}

export function useWallets() {
  const { userSession } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWallets = useCallback(async () => {
    if (!userSession) {
      throw new Error('No user session available');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await circleApi.listWallets(userSession.userToken);
      return result.wallets;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get wallets';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userSession]);

  return { getWallets, loading, error };
}

export function useWalletBalance() {
  const { userSession } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBalance = useCallback(
    async (walletId: string): Promise<Balance[]> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      try {
        setLoading(true);
        setError(null);

        const result = await circleApi.getWalletBalance(
          userSession.userToken,
          walletId
        );
        return result.balances;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get balance';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userSession]
  );

  return { getBalance, loading, error };
}

export function useRestorePin() {
  const { userSession, executeChallenge } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restorePin = useCallback(async (): Promise<boolean> => {
    if (!userSession) {
      throw new Error('No user session available');
    }

    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true);
        setError(null);

        const { challengeId } = await circleApi.restorePin(userSession.userToken);

        executeChallenge(challengeId, (err, result) => {
          if (err) {
            setLoading(false);
            const errorMessage = err.message || 'Failed to restore PIN';
            setError(errorMessage);
            reject(err);
            return;
          }

          handleChallengeStatus(result, 'PIN restore', {
            setLoading,
            setError,
            resolve,
            reject,
          });
        });
      } catch (err: any) {
        setLoading(false);
        const errorMessage = err.message || 'Failed to restore PIN';
        setError(errorMessage);
        reject(err);
      }
    });
  }, [userSession, executeChallenge]);

  return { restorePin, loading, error };
}

export function useTransaction() {
  const { userSession, executeChallenge } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useCallback(
    async (
      walletId: string,
      destinationAddress: string,
      amount: string,
      tokenId?: string
    ): Promise<boolean> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      return new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          setError(null);

          const { challengeId } = await circleApi.createTransaction(
            userSession.userToken,
            walletId,
            destinationAddress,
            amount,
            tokenId
          );

          executeChallenge(challengeId, (err, result) => {
            if (err) {
              setLoading(false);
              const errorMessage = err.message || 'Transaction failed';
              setError(errorMessage);
              reject(err);
              return;
            }

            handleChallengeStatus(result, 'Transaction', {
              setLoading,
              setError,
              resolve,
              reject,
            });
          });
        } catch (err: any) {
          setLoading(false);
          const errorMessage = err.message || 'Failed to create transaction';
          setError(errorMessage);
          reject(err);
        }
      });
    },
    [userSession, executeChallenge]
  );

  return { sendTransaction, loading, error };
}

