/**
 * Vault Configurations
 * 
 * Helper functions to get vault configurations for the VaultActionModal
 */

import { CONTRACT_ADDRESSES } from './wolfBaseLendingVault';

export interface VaultConfig {
  address: `0x${string}`;
  name: string;
  blockchain: string;
  chainId: number;
  riskLevel?: 'low' | 'medium' | 'high';
  description?: string;
}

/**
 * Get all available vault configurations
 */
export function getAllVaultConfigs(): VaultConfig[] {
  const vaults: VaultConfig[] = [
    {
      address: CONTRACT_ADDRESSES.arc.lowRiskLendingVault,
      name: "Wolf Low Risk Lending Vault",
      blockchain: CONTRACT_ADDRESSES.arc.blockchain,
      chainId: CONTRACT_ADDRESSES.arc.chainId,
      riskLevel: 'low',
      description: 'Low-risk lending strategy on Arc with stable yields',
    },
    {
      address: CONTRACT_ADDRESSES.world.highRiskMemeIndexVault,
      name: "Wolf High Risk Meme Index Vault",
      blockchain: CONTRACT_ADDRESSES.world.blockchain,
      chainId: CONTRACT_ADDRESSES.world.chainId,
      riskLevel: 'high',
      description: 'High-risk meme coin index on World Chain',
    },
  ];
  
  // Add Celo vault if address is configured
  if (CONTRACT_ADDRESSES.celo.stakingVault !== '0x0000000000000000000000000000000000000000') {
    vaults.push({
      address: CONTRACT_ADDRESSES.celo.stakingVault,
      name: "Wolf Celo Staking Vault",
      blockchain: CONTRACT_ADDRESSES.celo.blockchain,
      chainId: CONTRACT_ADDRESSES.celo.chainId,
      riskLevel: 'medium',
      description: 'Staking vault on Celo with moderate risk',
    });
  }
  
  return vaults;
}

/**
 * Get vault config by chain name
 */
export function getVaultConfigByChain(chain: 'arc' | 'world' | 'base' | 'celo'): VaultConfig | null {
  switch (chain) {
    case 'arc':
      return {
        address: CONTRACT_ADDRESSES.arc.lowRiskLendingVault,
        name: "Wolf Low Risk Lending Vault",
        blockchain: CONTRACT_ADDRESSES.arc.blockchain,
        chainId: CONTRACT_ADDRESSES.arc.chainId,
        riskLevel: 'low',
      };
    case 'world':
      return {
        address: CONTRACT_ADDRESSES.world.highRiskMemeIndexVault,
        name: "Wolf High Risk Meme Index Vault",
        blockchain: CONTRACT_ADDRESSES.world.blockchain,
        chainId: CONTRACT_ADDRESSES.world.chainId,
        riskLevel: 'high',
      };
    case 'base':
      return {
        address: CONTRACT_ADDRESSES.base.testVault,
        name: "Base Test Vault",
        blockchain: CONTRACT_ADDRESSES.base.blockchain,
        chainId: CONTRACT_ADDRESSES.base.chainId,
        riskLevel: 'low',
      };
    case 'celo':
      return {
        address: CONTRACT_ADDRESSES.celo.stakingVault,
        name: "Wolf Celo Staking Vault",
        blockchain: CONTRACT_ADDRESSES.celo.blockchain,
        chainId: CONTRACT_ADDRESSES.celo.chainId,
        riskLevel: 'medium',
      };
    default:
      return null;
  }
}

/**
 * Get vault config by address
 */
export function getVaultConfigByAddress(address: string): VaultConfig | null {
  const vaults = getAllVaultConfigs();
  return vaults.find(v => v.address.toLowerCase() === address.toLowerCase()) || null;
}

/**
 * Get vaults by risk level
 */
export function getVaultsByRiskLevel(riskLevel: 'low' | 'medium' | 'high'): VaultConfig[] {
  return getAllVaultConfigs().filter(v => v.riskLevel === riskLevel);
}

