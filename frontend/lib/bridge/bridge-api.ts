/**
 * Bridge API Client
 * Calls backend Bridge Kit service
 */

import type { SupportedChainId } from './chains.config';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface BridgeTransferRequest {
  fromChain: string;
  toChain: string;
  amount: string;
  destinationAddress: string;
}

export interface BridgeTransferResponse {
  success: boolean;
  transactionHash?: string;
  attestationHash?: string;
  message: string;
  details?: any;
}

export interface BridgeEstimate {
  fromChain: string;
  toChain: string;
  amount: string;
  estimatedTime: string;
  estimatedFee: string;
  protocol: string;
  message: string;
}

export interface BridgeInfo {
  wallet: {
    address: string;
    isConfigured: boolean;
  };
  chains: {
    supported: Array<{
      name: string;
      chainId: number;
      symbol: string;
    }>;
    note: string;
  };
  status: string;
  technology: string;
}

/**
 * Maps our chain IDs to chain names expected by backend
 */
function getChainName(chainId: SupportedChainId): string {
  const chainMap: Record<SupportedChainId, string> = {
    5042002: 'Arc',
    11155111: 'Celo',
    4801: 'World',
  };
  return chainMap[chainId] || 'Unknown';
}

/**
 * Execute a bridge transfer via backend Bridge Kit
 */
export async function bridgeTransfer(params: {
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  amount: string;
  recipientAddress: string;
}): Promise<BridgeTransferResponse> {
  const request: BridgeTransferRequest = {
    fromChain: getChainName(params.sourceChainId),
    toChain: getChainName(params.destinationChainId),
    amount: params.amount,
    destinationAddress: params.recipientAddress,
  };

  const response = await fetch(`${BACKEND_URL}/api/bridge/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Bridge transfer failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get bridge estimate
 */
export async function getBridgeEstimate(
  sourceChainId: SupportedChainId,
  destinationChainId: SupportedChainId,
  amount: string
): Promise<BridgeEstimate> {
  const request = {
    fromChain: getChainName(sourceChainId),
    toChain: getChainName(destinationChainId),
    amount,
  };

  const response = await fetch(`${BACKEND_URL}/api/bridge/estimate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to get estimate: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get bridge service info
 */
export async function getBridgeInfo(): Promise<BridgeInfo> {
  const response = await fetch(`${BACKEND_URL}/api/bridge/info`);

  if (!response.ok) {
    throw new Error(`Failed to get bridge info: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Health check for bridge service
 */
export async function checkBridgeHealth(): Promise<{
  status: string;
  service: string;
  wallet: any;
  timestamp: string;
}> {
  const response = await fetch(`${BACKEND_URL}/api/bridge/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Execute demo bridge (for testing)
 */
export async function bridgeDemo(): Promise<BridgeTransferResponse> {
  const response = await fetch(`${BACKEND_URL}/api/bridge/demo`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Demo bridge failed: ${response.statusText}`);
  }

  return response.json();
}

