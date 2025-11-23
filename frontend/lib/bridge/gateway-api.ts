/**
 * Circle Gateway API Client (Frontend)
 * 
 * Provides access to unified crosschain USDC balance management
 * via Circle Gateway API through our backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface GatewayBalanceSummary {
  totalUSDC: number;
  chains: Array<{
    chainName: string;
    domain: number;
    balance: string;
    balanceFormatted: number;
  }>;
}

export interface GatewayDomain {
  name: string;
  domain: number;
}

export interface GatewayInfo {
  domains: Array<{
    chain: string;
    network: string;
    domain: number;
    walletContract?: string;
    minterContract?: string;
  }>;
}

/**
 * Get Gateway API information including supported chains
 */
export async function getGatewayInfo(): Promise<GatewayInfo> {
  const response = await fetch(`${API_BASE_URL}/api/bridge/gateway/info`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch Gateway info');
  }
  
  return response.json();
}

/**
 * Get unified USDC balance across all supported chains for a given address
 */
export async function getUnifiedBalance(address: string): Promise<{
  success: boolean;
  data?: GatewayBalanceSummary;
  message?: string;
}> {
  const response = await fetch(
    `${API_BASE_URL}/api/bridge/gateway/balance?address=${encodeURIComponent(address)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch unified balance');
  }
  
  return response.json();
}

/**
 * Get supported Gateway domains for our app
 */
export async function getSupportedDomains(): Promise<{
  success: boolean;
  domains: GatewayDomain[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/bridge/gateway/domains`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch supported domains');
  }
  
  return response.json();
}

/**
 * Format USDC amount for display
 */
export function formatUSDC(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return '0.00';
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * Get chain color by domain
 */
export function getChainColor(chainName: string): string {
  const colors: Record<string, string> = {
    'Arc Testnet': 'from-blue-500 to-purple-500',
    'World Chain Sepolia': 'from-green-500 to-teal-500',
    'Base Sepolia': 'from-blue-600 to-indigo-600',
  };
  
  return colors[chainName] || 'from-gray-500 to-gray-600';
}

/**
 * Get chain icon/emoji by domain
 */
export function getChainIcon(chainName: string): string {
  const icons: Record<string, string> = {
    'Arc Testnet': '⚡',
    'World Chain Sepolia': '🌍',
    'Base Sepolia': '🔵',
  };
  
  return icons[chainName] || '⛓️';
}

