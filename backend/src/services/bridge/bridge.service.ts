/**
 * Circle Bridge Kit Service
 * Handles cross-chain USDC bridging using Circle's Bridge Kit
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BridgingKit } from '@circle-fin/bridging-kit';
import { createAdapterFromPrivateKey } from '@circle-fin/adapter-viem-v2';

// Chain name to ID mapping
const CHAIN_MAP: Record<string, number> = {
  'Arc': 5042002,
  'Celo': 11155111,
  'World': 4801,
};

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

    // Map chain names to chain IDs
    const fromChainId = CHAIN_MAP[request.fromChain];
    const toChainId = CHAIN_MAP[request.toChain];

    if (!fromChainId || !toChainId) {
      this.logger.error(`Invalid chain names: ${request.fromChain} -> ${request.toChain}`);
      return {
        success: false,
        message: `Invalid chain names. Supported chains: ${Object.keys(CHAIN_MAP).join(', ')}`,
      };
    }

    this.logger.log(`Resolved chain IDs: ${fromChainId} -> ${toChainId}`);

    try {
      const adapter = createAdapterFromPrivateKey({
        privateKey: this.bridgeWalletPrivateKey as `0x${string}`,
      });

      this.logger.log('Created adapter for source chain');

      const result = await this.kit.bridge({
        from: {
          adapter: adapter as any,
          chain: fromChainId,
        },
        to: {
          adapter: adapter as any,
          chain: toChainId,
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
   * Get supported chains directly from Circle's Bridge Kit SDK
   * This is the authoritative list of what chains are actually supported
   */
  getSupportedChains() {
    try {
      // Get the actual supported chains from the Bridge Kit
      const supportedChains = this.kit.getSupportedChains();
      
      this.logger.log(`Bridge Kit supports ${supportedChains.length} chains`);
      
      // Separate testnet and mainnet chains
      const testnetChains = supportedChains.filter((chain: any) => chain.isTestnet);
      const mainnetChains = supportedChains.filter((chain: any) => !chain.isTestnet);
      
      // Check if Arc is in the list
      const hasArc = supportedChains.some((chain: any) => 
        chain.name?.toLowerCase().includes('arc') || 
        chain.chain?.toLowerCase().includes('arc') ||
        chain.chainId === 5042002
      );
      
      // Check if Celo is in the list
      const hasCelo = supportedChains.some((chain: any) => 
        chain.name?.toLowerCase().includes('celo') && 
        (chain.chainId === 44787 || chain.chainId === 42220)
      );
      
      return {
        totalChains: supportedChains.length,
        testnetCount: testnetChains.length,
        mainnetCount: mainnetChains.length,
        hasArcSupport: hasArc,
        hasCeloSupport: hasCelo,
        testnetChains: testnetChains.map((chain: any) => ({
          name: chain.name,
          chain: chain.chain,
          chainId: chain.chainId,
          type: chain.type,
          usdcAddress: chain.usdcAddress,
        })),
        mainnetChains: mainnetChains.map((chain: any) => ({
          name: chain.name,
          chain: chain.chain,
          chainId: chain.chainId,
          type: chain.type,
          usdcAddress: chain.usdcAddress,
        })),
        allChainNames: supportedChains.map((chain: any) => chain.name).sort(),
        note: 'This is the authoritative list from Circle Bridge Kit SDK',
      };
    } catch (error) {
      this.logger.error('Failed to get supported chains', error);
      return {
        error: 'Failed to retrieve supported chains from Bridge Kit',
        details: error,
      };
    }
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

