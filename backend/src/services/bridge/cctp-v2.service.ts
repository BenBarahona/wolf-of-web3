/**
 * CCTP V2 Direct Integration
 * Circle's Cross-Chain Transfer Protocol V2 with Arc Testnet support
 * 
 * According to Circle docs: https://developers.circle.com/cctp/cctp-supported-blockchains
 * Arc Testnet IS supported as of November 2025
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, createWalletClient, http, parseUnits, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// CCTP V2 Supported Chains with Arc Testnet
export const CCTP_V2_CHAINS = {
  // Testnets
  'Arc Testnet': {
    chainId: 5042002,
    name: 'Arc Testnet',
    rpcUrl: 'https://arc-testnet.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g',
    usdcAddress: '0x3600000000000000000000000000000000000000' as Address,
    // FOUND: Source: https://docs.arc.network/arc/references/contract-addresses
    tokenMessengerAddress: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA' as Address,
    messageTransmitterAddress: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275' as Address,
    domain: 26,
  },
  'Ethereum Sepolia': {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as Address,
    tokenMessengerAddress: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as Address,
    messageTransmitterAddress: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD' as Address,
    domain: 0,
  },
  'Base Sepolia': {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address,
    tokenMessengerAddress: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as Address,
    messageTransmitterAddress: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD' as Address,
    domain: 6,
  },
  'World Chain Sepolia': {
    chainId: 4801,
    name: 'World Chain Sepolia',
    rpcUrl: 'https://worldchain-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g',
    usdcAddress: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88' as Address,
    tokenMessengerAddress: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA' as Address,
    messageTransmitterAddress: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275' as Address,
    domain: 14,
  },
  'Arbitrum Sepolia': {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' as Address,
    tokenMessengerAddress: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as Address,
    messageTransmitterAddress: '0xaCF1ceeF35caAc005e15888dDb8A3515C41B4872' as Address,
    domain: 3,
  },
  'OP Sepolia': {
    chainId: 11155420,
    name: 'OP Sepolia',
    rpcUrl: 'https://sepolia.optimism.io',
    usdcAddress: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7' as Address,
    tokenMessengerAddress: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as Address,
    messageTransmitterAddress: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD' as Address,
    domain: 2,
  },
  'Polygon Amoy': {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    usdcAddress: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582' as Address,
    tokenMessengerAddress: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5' as Address,
    messageTransmitterAddress: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD' as Address,
    domain: 7,
  },
} as const;

// TokenMessenger ABI - only the methods we need
const TOKEN_MESSENGER_ABI = [
  {
    name: 'depositForBurn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }],
  },
] as const;

// ERC20 ABI - for approvals and balance checks
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/**
 * Helper function to convert BigInt values to strings for JSON serialization
 * Recursively processes objects and arrays
 */
function sanitizeBigInts(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeBigInts);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeBigInts(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

export interface CCTPV2BridgeRequest {
  fromChain: string;
  toChain: string;
  amount: string;
  destinationAddress: string;
}

export interface CCTPV2BridgeResponse {
  success: boolean;
  transactionHash?: string;
  nonce?: string;
  message: string;
  details?: any;
}

@Injectable()
export class CCTPV2Service {
  private readonly logger = new Logger(CCTPV2Service.name);
  private readonly bridgeWalletPrivateKey: string | undefined;
  private readonly bridgeWalletAddress: string | undefined;

  constructor(private configService: ConfigService) {
    this.bridgeWalletPrivateKey = this.configService.get<string>('BRIDGE_WALLET_PRIVATE_KEY');
    this.bridgeWalletAddress = this.configService.get<string>('BRIDGE_WALLET_ADDRESS');

    if (!this.bridgeWalletPrivateKey) {
      this.logger.warn('BRIDGE_WALLET_PRIVATE_KEY not configured - CCTP V2 service will not function');
    }

    this.logger.log('CCTP V2 service initialized with Arc Testnet support');
  }

  async bridgeUSDC(request: CCTPV2BridgeRequest): Promise<CCTPV2BridgeResponse> {
    this.logger.log(`CCTP V2 Bridge request: ${request.amount} USDC from ${request.fromChain} to ${request.toChain}`);

    if (!this.bridgeWalletPrivateKey) {
      return {
        success: false,
        message: 'Bridge wallet not configured. Please set BRIDGE_WALLET_PRIVATE_KEY in environment.',
      };
    }

    // Get chain configurations
    const sourceChain = CCTP_V2_CHAINS[request.fromChain];
    const destChain = CCTP_V2_CHAINS[request.toChain];

    if (!sourceChain || !destChain) {
      this.logger.error(`Invalid chain names: ${request.fromChain} -> ${request.toChain}`);
      return {
        success: false,
        message: `Invalid chain names. Supported chains: ${Object.keys(CCTP_V2_CHAINS).join(', ')}`,
      };
    }

    this.logger.log(`Resolved chains: ${sourceChain.chainId} -> ${destChain.chainId}`);
    this.logger.log(`CCTP Domains: ${sourceChain.domain} -> ${destChain.domain}`);

    try {
      // Create account from private key - ensure proper formatting
      let privateKey = this.bridgeWalletPrivateKey;
      
      // Add 0x prefix if missing
      if (!privateKey.startsWith('0x')) {
        privateKey = `0x${privateKey}`;
      }
      
      // Validate length (should be 64 hex chars + 0x prefix = 66 total)
      if (privateKey.length !== 66) {
        throw new Error(`Invalid private key length: ${privateKey.length}. Expected 66 characters (0x + 64 hex chars)`);
      }

      this.logger.log('Creating account from private key...');
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.logger.log(`Account address: ${account.address}`);
      
      // Create viem clients for source chain
      const publicClient = createPublicClient({
        chain: {
          id: sourceChain.chainId,
          name: sourceChain.name,
          network: sourceChain.name,
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: { http: [sourceChain.rpcUrl] },
            public: { http: [sourceChain.rpcUrl] },
          },
        } as any,
        transport: http(sourceChain.rpcUrl),
      });

      const walletClient = createWalletClient({
        account,
        chain: {
          id: sourceChain.chainId,
          name: sourceChain.name,
          network: sourceChain.name,
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: { http: [sourceChain.rpcUrl] },
            public: { http: [sourceChain.rpcUrl] },
          },
        } as any,
        transport: http(sourceChain.rpcUrl),
      });

      // Parse amount (USDC has 6 decimals)
      const amountInSmallestUnit = parseUnits(request.amount, 6);
      
      this.logger.log(`Amount to bridge: ${amountInSmallestUnit.toString()} (${request.amount} USDC)`);

      // Check if contracts are configured for this chain
      if (sourceChain.tokenMessengerAddress === '0x' || destChain.tokenMessengerAddress === '0x') {
        this.logger.warn(`CCTP contracts not yet configured for ${sourceChain.name} or ${destChain.name}`);
        return {
          success: false,
          message: `CCTP V2 contracts not yet configured for this route. While Arc Testnet is supported by CCTP V2, contract addresses need to be added to the configuration.`,
          details: {
            note: 'Please check Circle documentation for the latest CCTP V2 contract addresses',
            docUrl: 'https://developers.circle.com/cctp/cctp-supported-blockchains',
          },
        };
      }

      // Step 1: Check USDC balance
      const balance = await publicClient.readContract({
        address: sourceChain.usdcAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [account.address],
      });

      this.logger.log(`USDC Balance: ${balance.toString()}`);

      if (balance < amountInSmallestUnit) {
        return {
          success: false,
          message: `Insufficient USDC balance. Have: ${balance.toString()}, Need: ${amountInSmallestUnit.toString()}`,
        };
      }

      // Step 2: Check and approve if needed
      const currentAllowance = await publicClient.readContract({
        address: sourceChain.usdcAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, sourceChain.tokenMessengerAddress],
      });

      if (currentAllowance < amountInSmallestUnit) {
        this.logger.log('Approving USDC spend...');
        const approveTx = await walletClient.writeContract({
          address: sourceChain.usdcAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [sourceChain.tokenMessengerAddress, amountInSmallestUnit],
          chain: null,
        } as any);
        
        this.logger.log(`Approval tx: ${approveTx}`);
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
        this.logger.log('Approval confirmed');
      }

      // Step 3: Call depositForBurn on TokenMessenger
      // Convert destination address to bytes32
      const destinationAddressBytes32 = `0x${request.destinationAddress.slice(2).padStart(64, '0')}` as `0x${string}`;

      this.logger.log('Calling depositForBurn...');
      const burnTx = await walletClient.writeContract({
        address: sourceChain.tokenMessengerAddress,
        abi: TOKEN_MESSENGER_ABI,
        functionName: 'depositForBurn',
        args: [
          amountInSmallestUnit,
          destChain.domain,
          destinationAddressBytes32,
          sourceChain.usdcAddress,
        ],
        chain: null,
      } as any);

      this.logger.log(`Burn transaction: ${burnTx}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: burnTx });

      this.logger.log('CCTP V2 burn transaction completed');

      // Sanitize receipt to convert BigInt values to strings for JSON serialization
      const sanitizedReceipt = sanitizeBigInts(receipt);

      return {
        success: true,
        transactionHash: burnTx,
        message: `Successfully initiated CCTP V2 bridge: ${request.amount} USDC from ${request.fromChain} to ${request.toChain}. The attestation and minting will happen automatically via CCTP.`,
        details: {
          sourceChain: request.fromChain,
          destChain: request.toChain,
          burnTxHash: burnTx,
          receipt: sanitizedReceipt,
          note: 'Attestation and minting on destination chain happens automatically. Check Circle Attestation API for status.',
          attestationAPI: 'https://iris-api-sandbox.circle.com/v1/attestations',
        },
      };
    } catch (error: any) {
      this.logger.error('CCTP V2 bridge transaction failed', error);
      
      // Sanitize error object in case it contains BigInts
      const sanitizedError = sanitizeBigInts(error);
      
      return {
        success: false,
        message: `CCTP V2 bridge failed: ${error?.message || 'Unknown error'}`,
        details: sanitizedError,
      };
    }
  }

  getSupportedChains() {
    return {
      chains: Object.entries(CCTP_V2_CHAINS).map(([name, config]) => ({
        name,
        chainId: config.chainId,
        usdcAddress: config.usdcAddress,
        domain: config.domain,
        configured: config.tokenMessengerAddress !== '0x',
      })),
      note: 'Based on Circle CCTP V2 documentation (November 2025)',
      documentation: 'https://developers.circle.com/cctp/cctp-supported-blockchains',
      includesArcTestnet: true,
    };
  }

  getBridgeWalletInfo() {
    return {
      address: this.bridgeWalletAddress || 'Not configured',
      isConfigured: !!this.bridgeWalletPrivateKey,
    };
  }
}

