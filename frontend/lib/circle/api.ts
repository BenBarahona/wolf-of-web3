const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Gets Circle configuration including App ID
 */
export async function getCircleConfig(): Promise<{ appId: string }> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/config`);
  const result: ApiResponse<{ appId: string }> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to get Circle config');
  }
  
  return result.data;
}

export async function createUser(
  userId?: string,
  email?: string,
  username?: string
) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/user/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, email, username }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to create user');
  }
  
  return result.data;
}

export async function loginUser(email: string): Promise<{
  userId: string;
  userToken: string;
  encryptionKey: string;
  challengeId: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to login');
  }
  
  return result.data;
}

export async function acquireSessionToken(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/user/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to acquire token');
  }
  
  return result.data;
}

export async function createChallenge(userToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': userToken,
    },
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to create challenge');
  }
  
  return result.data;
}

export async function createWallet(
  userToken: string,
  blockchain: string = 'ARC-TESTNET',
  accountType: 'SCA' | 'EOA' = 'SCA'
) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/wallet/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': userToken,
    },
    body: JSON.stringify({ blockchain, accountType }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to create wallet');
  }
  
  return result.data;
}

export async function getUserStatus(userToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/user/status`, {
    headers: {
      'X-User-Token': userToken,
    },
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to get user status');
  }
  
  return result.data;
}

export async function listWallets(userToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/wallets`, {
    headers: {
      'X-User-Token': userToken,
    },
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to list wallets');
  }
  
  return result.data;
}

export async function getWalletBalance(userToken: string, walletId: string) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/wallet/balance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': userToken,
    },
    body: JSON.stringify({ walletId }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to get wallet balance');
  }
  
  return result.data;
}

export async function restorePin(userToken: string) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/user/pin/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': userToken,
    },
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to restore PIN');
  }
  
  return result.data;
}

/**
 * Create transaction
 */
export async function createTransaction(
  userToken: string,
  walletId: string,
  destinationAddress: string,
  amount: string,
  tokenId?: string
) {
  const response = await fetch(`${API_BASE_URL}/api/wallet/transaction/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Token': userToken,
    },
    body: JSON.stringify({
      walletId,
      destinationAddress,
      amount,
      tokenId,
    }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to create transaction');
  }
  
  return result.data;
}

