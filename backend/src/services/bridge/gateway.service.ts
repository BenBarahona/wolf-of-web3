/**
 * Circle Gateway Service
 * 
 * Provides unified crosschain USDC balance management across multiple chains
 * using Circle Gateway API.
 * 
 * Documentation: https://developers.circle.com/gateway/quickstarts/unified-balance
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Gateway API domain identifiers
// https://developers.circle.com/cctp/cctp-supported-blockchains#cctp-supported-domains
export const GATEWAY_DOMAINS = {
  'Ethereum Sepolia': 0,
  'Avalanche Fuji': 1,
  'OP Sepolia': 2,
  'Arbitrum Sepolia': 3,
  'Base Sepolia': 6,
  'Polygon Amoy': 7,
  'World Chain Sepolia': 14,
  'Arc Testnet': 26,
} as const;

export const DOMAIN_TO_CHAIN_NAME: Record<number, string> = {
  0: 'Ethereum Sepolia',
  1: 'Avalanche Fuji',
  2: 'OP Sepolia',
  3: 'Arbitrum Sepolia',
  6: 'Base Sepolia',
  7: 'Polygon Amoy',
  14: 'World Chain Sepolia',
  26: 'Arc Testnet',
};

export interface BalanceSource {
  depositor: string;
  domain: number;
}

export interface BalanceRequest {
  token: string; // e.g., "USDC"
  sources: BalanceSource[];
}

export interface BalanceResponse {
  balances: Array<{
    domain: number;
    balance: string;
    depositor: string;
  }>;
}

export interface TransferSpec {
  version: number;
  sourceDomain: number;
  destinationDomain: number;
  sourceContract: string;
  destinationContract: string;
  sourceToken: string;
  destinationToken: string;
  sourceDepositor: string;
  destinationRecipient: string;
  sourceSigner: string;
  destinationCaller: string;
  value: string;
  salt: string;
  hookData: string;
}

export interface BurnIntent {
  maxBlockHeight: string;
  maxFee: string;
  spec: TransferSpec;
}

export interface TransferRequest {
  burnIntent: BurnIntent;
  signature: string;
}

export interface TransferResponse {
  success: boolean;
  attestation?: string;
  signature?: string;
  message?: string;
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

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly baseUrl = 'https://gateway-api-testnet.circle.com/v1';

  constructor(private configService: ConfigService) {
    this.logger.log('Circle Gateway service initialized');
  }

  /**
   * Get information about supported chains and contracts
   */
  async getInfo(): Promise<GatewayInfo> {
    try {
      this.logger.log('Fetching Gateway API info...');
      const response = await axios.get(`${this.baseUrl}/info`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching Gateway info:', error.response?.data || error.message);
      throw new Error(`Failed to fetch Gateway info: ${error.message}`);
    }
  }

  /**
   * Check unified balances across multiple domains for a given depositor
   * 
   * @param depositor - The wallet address to check balances for
   * @param domains - Optional array of domain IDs to check. If not provided, checks all supported domains.
   */
  async getUnifiedBalance(
    depositor: string,
    domains?: number[],
  ): Promise<BalanceResponse> {
    try {
      this.logger.log(`Fetching unified balance for ${depositor}`);

      // Default to Arc, World, and Base if no domains specified
      const domainsToCheck = domains || [
        GATEWAY_DOMAINS['Arc Testnet'],
        GATEWAY_DOMAINS['World Chain Sepolia'],
        GATEWAY_DOMAINS['Base Sepolia'],
      ];

      const requestBody: BalanceRequest = {
        token: 'USDC',
        sources: domainsToCheck.map((domain) => ({
          depositor,
          domain,
        })),
      };

      const response = await axios.post(`${this.baseUrl}/balances`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Successfully fetched balances for ${domainsToCheck.length} domains`);
      return response.data;
    } catch (error: any) {
      this.logger.error('Error fetching unified balance:', error.response?.data || error.message);
      throw new Error(`Failed to fetch unified balance: ${error.message}`);
    }
  }

  /**
   * Get balances for our specific chains (Arc, World, Base)
   */
  async getWolfChainBalances(depositor: string): Promise<{
    arc: string;
    world: string;
    base: string;
    total: number;
    balances: BalanceResponse;
  }> {
    try {
      const balances = await this.getUnifiedBalance(depositor);

      // Parse balances for each chain
      const arcBalance = balances.balances.find(
        (b) => b.domain === GATEWAY_DOMAINS['Arc Testnet'],
      );
      const worldBalance = balances.balances.find(
        (b) => b.domain === GATEWAY_DOMAINS['World Chain Sepolia'],
      );
      const baseBalance = balances.balances.find(
        (b) => b.domain === GATEWAY_DOMAINS['Base Sepolia'],
      );

      const arc = arcBalance?.balance || '0';
      const world = worldBalance?.balance || '0';
      const base = baseBalance?.balance || '0';

      // Calculate total (balances are in USDC with decimals)
      const total =
        parseFloat(arc) + parseFloat(world) + parseFloat(base);

      return {
        arc,
        world,
        base,
        total,
        balances,
      };
    } catch (error: any) {
      this.logger.error('Error fetching Wolf chain balances:', error.message);
      throw error;
    }
  }

  /**
   * Submit burn intents to Gateway API to initiate a transfer
   * Note: This requires signed burn intents from the user
   */
  async transfer(
    transferRequests: TransferRequest[],
  ): Promise<TransferResponse> {
    try {
      this.logger.log('Submitting transfer request to Gateway API...');

      const response = await axios.post(`${this.baseUrl}/transfer`, transferRequests, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log('Transfer attestation received from Gateway');
      return {
        success: true,
        attestation: response.data.attestation,
        signature: response.data.signature,
      };
    } catch (error: any) {
      this.logger.error('Error submitting transfer:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get a formatted summary of unified balances
   */
  async getBalanceSummary(depositor: string): Promise<{
    totalUSDC: number;
    chains: Array<{
      chainName: string;
      domain: number;
      balance: string;
      balanceFormatted: number;
    }>;
  }> {
    try {
      const wolfBalances = await this.getWolfChainBalances(depositor);

      const chains = [
        {
          chainName: 'Arc Testnet',
          domain: GATEWAY_DOMAINS['Arc Testnet'],
          balance: wolfBalances.arc,
          balanceFormatted: parseFloat(wolfBalances.arc),
        },
        {
          chainName: 'World Chain Sepolia',
          domain: GATEWAY_DOMAINS['World Chain Sepolia'],
          balance: wolfBalances.world,
          balanceFormatted: parseFloat(wolfBalances.world),
        },
        {
          chainName: 'Base Sepolia',
          domain: GATEWAY_DOMAINS['Base Sepolia'],
          balance: wolfBalances.base,
          balanceFormatted: parseFloat(wolfBalances.base),
        },
      ];

      return {
        totalUSDC: wolfBalances.total,
        chains,
      };
    } catch (error: any) {
      this.logger.error('Error getting balance summary:', error.message);
      throw error;
    }
  }

  /**
   * Get supported domains for our app
   */
  getSupportedDomains(): Array<{ name: string; domain: number }> {
    return [
      { name: 'Arc Testnet', domain: GATEWAY_DOMAINS['Arc Testnet'] },
      { name: 'World Chain Sepolia', domain: GATEWAY_DOMAINS['World Chain Sepolia'] },
      { name: 'Base Sepolia', domain: GATEWAY_DOMAINS['Base Sepolia'] },
    ];
  }
}

