/**
 * Bridge API Client
 * Calls backend CCTP V2 service (with Arc Testnet support)
 */

import type { SupportedChainId } from './chains.config';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Use CCTP V2 endpoints for Arc support
const USE_CCTP_V2 = true;

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

function getChainName(chainId: SupportedChainId): string {
  // Map to CCTP V2 chain names (must match backend cctp-v2.service.ts)
  const chainMap: Record<SupportedChainId, string> = {
    5042002: 'Arc Testnet',
    11155111: 'Ethereum Sepolia', // Fixed: was incorrectly "Celo"
    4801: 'World Chain Sepolia', // Fixed: was incorrectly "World"
  };
  return chainMap[chainId] || 'Unknown';
}

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

  // Use CCTP V2 endpoint for Arc support
  const endpoint = USE_CCTP_V2 
    ? `${BACKEND_URL}/api/bridge/cctp-v2/transfer`
    : `${BACKEND_URL}/api/bridge/transfer`;

  console.log('🌉 Bridge Transfer:', {
    endpoint,
    from: request.fromChain,
    to: request.toChain,
    amount: request.amount,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Bridge transfer failed: ${response.statusText}`);
  }

  return response.json();
}

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

export async function getBridgeInfo(): Promise<BridgeInfo> {
  // Use CCTP V2 info for Arc support
  const endpoint = USE_CCTP_V2
    ? `${BACKEND_URL}/api/bridge/cctp-v2/info`
    : `${BACKEND_URL}/api/bridge/info`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to get bridge info: ${response.statusText}`);
  }

  return response.json();
}

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

export async function bridgeDemo(): Promise<BridgeTransferResponse> {
  const response = await fetch(`${BACKEND_URL}/api/bridge/demo`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Demo bridge failed: ${response.statusText}`);
  }

  return response.json();
}

