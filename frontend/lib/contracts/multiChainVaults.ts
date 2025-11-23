/**
 * Multi-Chain Vault Management
 * Utilities for interacting with vaults across Arc, Celo, and World chains
 */

import { SUPPORTED_CHAINS, getVaultInfo, getUSDCAddress, type SupportedChainId } from '@/lib/bridge';
import { WOLF_BASE_LENDING_VAULT_ABI } from './wolfBaseLendingVault';

export interface VaultInfo {
  chainId: SupportedChainId;
  chainName: string;
  vaultAddress: `0x${string}`;
  vaultName: string;
  vaultSymbol: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  usdcAddress: `0x${string}`;
}

export function getAllVaults(): VaultInfo[] {
  return SUPPORTED_CHAINS.map((chain) => {
    const vaultConfig = getVaultInfo(chain.id);
    return {
      chainId: chain.id,
      chainName: chain.name,
      vaultAddress: vaultConfig.address,
      vaultName: vaultConfig.name,
      vaultSymbol: vaultConfig.symbol,
      riskLevel: vaultConfig.riskLevel,
      description: vaultConfig.description,
      usdcAddress: getUSDCAddress(chain.id),
    };
  });
}

export function getVaultByChainId(chainId: SupportedChainId): VaultInfo {
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }

  const vaultConfig = getVaultInfo(chainId);
  return {
    chainId: chain.id,
    chainName: chain.name,
    vaultAddress: vaultConfig.address,
    vaultName: vaultConfig.name,
    vaultSymbol: vaultConfig.symbol,
    riskLevel: vaultConfig.riskLevel,
    description: vaultConfig.description,
    usdcAddress: getUSDCAddress(chainId),
  };
}

export function getVaultsByRiskLevel(
  riskLevel: 'low' | 'medium' | 'high'
): VaultInfo[] {
  return getAllVaults().filter((vault) => vault.riskLevel === riskLevel);
}

export const VAULT_ABI = WOLF_BASE_LENDING_VAULT_ABI;

export const VAULT_READ_FUNCTIONS = {
  totalAssets: 'totalAssets',
  maxTotalAssets: 'maxTotalAssets',
  cooldown: 'cooldown',
  balanceOf: 'balanceOf',
  convertToAssets: 'convertToAssets',
  convertToShares: 'convertToShares',
  maxDeposit: 'maxDeposit',
  maxWithdraw: 'maxWithdraw',
  previewDeposit: 'previewDeposit',
  previewWithdraw: 'previewWithdraw',
  positions: 'positions',
} as const;

export const VAULT_WRITE_FUNCTIONS = {
  deposit: 'deposit',
  withdraw: 'withdraw',
  mint: 'mint',
  redeem: 'redeem',
} as const;

export const RISK_LEVEL_CONFIG = {
  low: {
    label: 'Low Risk',
    color: 'green',
    expectedAPY: '3-5%',
    description: 'Conservative lending strategies with stable returns',
    suitableFor: 'Risk-averse investors seeking stable yields',
  },
  medium: {
    label: 'Medium Risk',
    color: 'yellow',
    expectedAPY: '8-15%',
    description: 'Balanced staking strategies with moderate returns',
    suitableFor: 'Investors comfortable with moderate volatility',
  },
  high: {
    label: 'High Risk',
    color: 'red',
    expectedAPY: '20-50%',
    description: 'Aggressive strategies with high potential returns',
    suitableFor: 'Experienced investors seeking maximum returns',
  },
} as const;

export function getRiskLevelConfig(riskLevel: 'low' | 'medium' | 'high') {
  return RISK_LEVEL_CONFIG[riskLevel];
}

/**
 * Calculate portfolio diversity score
 * Returns a score from 0-100 based on how diversified the portfolio is across chains and risk levels
 */
export function calculateDiversityScore(holdings: Array<{
  chainId: SupportedChainId;
  amount: number;
}>): number {
  if (holdings.length === 0) return 0;

  const totalAmount = holdings.reduce((sum, h) => sum + h.amount, 0);
  if (totalAmount === 0) return 0;

  // Calculate chain diversity (higher is better)
  const uniqueChains = new Set(holdings.map((h) => h.chainId)).size;
  const chainDiversityScore = (uniqueChains / SUPPORTED_CHAINS.length) * 50;

  // Calculate distribution evenness (lower standard deviation is better)
  const amounts = holdings.map((h) => h.amount);
  const mean = totalAmount / amounts.length;
  const variance =
    amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) /
    amounts.length;
  const stdDev = Math.sqrt(variance);
  const distributionScore = Math.max(0, 50 - (stdDev / mean) * 100);

  return Math.min(100, Math.round(chainDiversityScore + distributionScore));
}

/**
 * Recommend optimal chain based on current holdings and risk tolerance
 */
export function recommendChain(
  currentHoldings: Array<{
    chainId: SupportedChainId;
    amount: number;
  }>,
  riskTolerance: 'low' | 'medium' | 'high'
): VaultInfo {
  const vaults = getVaultsByRiskLevel(riskTolerance);

  if (currentHoldings.length === 0) {
    // No holdings, return vault matching risk tolerance
    return vaults[0];
  }

  // Find vault matching risk tolerance that user has least exposure to
  const holdingsByChain = new Map<SupportedChainId, number>();
  currentHoldings.forEach((h) => {
    holdingsByChain.set(h.chainId, h.amount);
  });

  // Sort vaults by least exposure
  const sortedVaults = vaults.sort((a, b) => {
    const aAmount = holdingsByChain.get(a.chainId) || 0;
    const bAmount = holdingsByChain.get(b.chainId) || 0;
    return aAmount - bAmount;
  });

  return sortedVaults[0];
}

export function formatVaultAmount(amount: bigint | string): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
  const formatted = Number(amountBigInt) / 1_000_000;
  return formatted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function parseVaultAmount(amount: string): bigint {
  const num = parseFloat(amount);
  if (isNaN(num)) return BigInt(0);
  return BigInt(Math.floor(num * 1_000_000));
}

