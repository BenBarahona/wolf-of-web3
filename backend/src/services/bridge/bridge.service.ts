/**
 * Circle Bridge Kit Service
 * Handles cross-chain USDC bridging using Circle's Bridge Kit
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BridgingKit } from '@circle-fin/bridging-kit';
import { createAdapterFromPrivateKey } from '@circle-fin/adapter-viem-v2';

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

@Injectable()
export class BridgeService {
  private readonly logger = new Logger(BridgeService.name);
  private readonly kit: BridgingKit;
  private readonly bridgeWalletPrivateKey: string | undefined;
  private readonly bridgeWalletAddress: string | undefined;

  constructor(private configService: ConfigService) {
    this.kit = new BridgingKit();
    
    this.bridgeWalletPrivateKey = this.configService.get<string>('BRIDGE_WALLET_PRIVATE_KEY');
    this.bridgeWalletAddress = this.configService.get<string>('BRIDGE_WALLET_ADDRESS');

    if (!this.bridgeWalletPrivateKey) {
      this.logger.warn('BRIDGE_WALLET_PRIVATE_KEY not configured - bridge service will not function');
    }

    this.logger.log('Bridge Kit service initialized');
    if (this.bridgeWalletAddress) {
      this.logger.log(`Bridge wallet address: ${this.bridgeWalletAddress}`);
    }
  }

  async bridgeUSDC(request: BridgeTransferRequest): Promise<BridgeTransferResponse> {
    this.logger.log(`Bridge request: ${request.amount} USDC from ${request.fromChain} to ${request.toChain}`);

    if (!this.bridgeWalletPrivateKey) {
      return {
        success: false,
        message: 'Bridge wallet not configured. Please set BRIDGE_WALLET_PRIVATE_KEY in environment.',
      };
    }

    try {
      const adapter = createAdapterFromPrivateKey({
        privateKey: this.bridgeWalletPrivateKey as `0x${string}`,
      });

      this.logger.log('Created adapter for source chain');

      const result = await this.kit.bridge({
        from: adapter as any,
        to: {
          adapter: adapter as any,
        },
        amount: request.amount,
      } as any);

      this.logger.log('Bridge transaction completed', result);

      return {
        success: true,
        transactionHash: (result as any)?.txHash || (result as any)?.transactionHash || 'N/A',
        message: `Successfully bridged ${request.amount} USDC from ${request.fromChain} to ${request.toChain}`,
        details: result,
      };
    } catch (error: any) {
      this.logger.error('Bridge transaction failed', error);
      return {
        success: false,
        message: `Bridge failed: ${error?.message || 'Unknown error'}`,
        details: error,
      };
    }
  }

  /**
   * Demo endpoint - bridges a small amount to demonstrate Bridge Kit functionality
   * This is perfect for the hackathon demonstration
   */
  async bridgeDemo(): Promise<BridgeTransferResponse> {
    this.logger.log('Executing Bridge Kit demo transaction');

    if (!this.bridgeWalletPrivateKey) {
      return {
        success: false,
        message: 'Bridge wallet not configured. Please set BRIDGE_WALLET_PRIVATE_KEY in environment.',
      };
    }

    // Demo: Bridge 1 USDC from Arc to Celo
    const demoRequest: BridgeTransferRequest = {
      fromChain: 'Arc',
      toChain: 'Celo',
      amount: '1.0',
      destinationAddress: this.bridgeWalletAddress || '0x0000000000000000000000000000000000000000',
    };

    return this.bridgeUSDC(demoRequest);
  }

  /**
   * Get bridge wallet information
   */
  getBridgeWalletInfo() {
    return {
      address: this.bridgeWalletAddress || 'Not configured',
      isConfigured: !!this.bridgeWalletPrivateKey,
    };
  }

  /**
   * Get supported chains for bridging
   * Note: Bridge Kit supports these chains out of the box
   */
  getSupportedChains() {
    return {
      supported: [
        { name: 'Arc', chainId: 5042002, symbol: 'ARC' },
        { name: 'Celo', chainId: 11155111, symbol: 'CELO' },
        { name: 'World', chainId: 4801, symbol: 'WLD' },
        { name: 'Ethereum', chainId: 1, symbol: 'ETH' },
        { name: 'Base', chainId: 8453, symbol: 'BASE' },
        { name: 'Arbitrum', chainId: 42161, symbol: 'ARB' },
        { name: 'Polygon', chainId: 137, symbol: 'MATIC' },
      ],
      note: 'Bridge Kit handles contract addresses and routing automatically',
    };
  }

  /**
   * Estimate bridge time and fees
   */
  estimateBridge(fromChain: string, toChain: string, amount: string) {
    return {
      fromChain,
      toChain,
      amount,
      estimatedTime: '15-25 minutes',
      estimatedFee: '~0.01 USDC (gas only)',
      protocol: 'Circle CCTP',
      message: 'Bridge Kit handles all CCTP operations automatically',
    };
  }
}

