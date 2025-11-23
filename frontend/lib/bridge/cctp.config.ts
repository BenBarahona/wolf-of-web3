/**
 * CCTP (Cross-Chain Transfer Protocol) Contract Addresses
 * Official Circle CCTP deployment addresses for testnets
 */

import type { SupportedChainId } from './chains.config';

/**
 * TokenMessenger contract addresses per chain
 * Used to burn USDC on source chain
 */
export const TOKEN_MESSENGER_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  5042002: '0x0000000000000000000000000000000000000000', // Arc - VERIFY
  11155111: '0x0000000000000000000000000000000000000000', // Celo Sepolia - VERIFY
  4801: '0x0000000000000000000000000000000000000000', // World Sepolia - VERIFY
};

/**
 * MessageTransmitter contract addresses per chain
 * Used to receive USDC on destination chain
 */
export const MESSAGE_TRANSMITTER_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  5042002: '0x0000000000000000000000000000000000000000', // Arc - VERIFY
  11155111: '0x0000000000000000000000000000000000000000', // Celo Sepolia - VERIFY
  4801: '0x0000000000000000000000000000000000000000', // World Sepolia - VERIFY
};

/**
 * CCTP Domain IDs for each chain
 * Used in cross-chain messaging
 */
export const CCTP_DOMAINS: Record<SupportedChainId, number> = {
  5042002: 0, // Arc - VERIFY
  11155111: 0, // Celo Sepolia - VERIFY
  4801: 0, // World Sepolia - VERIFY
};

/**
 * TokenMessenger ABI - only the functions we need
 */
export const TOKEN_MESSENGER_ABI = [
  {
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
    ],
    name: 'depositForBurn',
    outputs: [{ name: 'nonce', type: 'uint64' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/**
 * MessageTransmitter ABI - only the functions we need
 */
export const MESSAGE_TRANSMITTER_ABI = [
  {
    inputs: [
      { name: 'message', type: 'bytes' },
      { name: 'attestation', type: 'bytes' },
    ],
    name: 'receiveMessage',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/**
 * Circle Attestation API endpoints
 */
export const CIRCLE_ATTESTATION_API = {
  testnet: 'https://iris-api-sandbox.circle.com',
  mainnet: 'https://iris-api.circle.com',
};

/**
 * Get current environment (testnet for now)
 */
export const CURRENT_ENV = 'testnet';

/**
 * Helper to convert address to bytes32 (for mintRecipient)
 */
export function addressToBytes32(address: string): `0x${string}` {
  return `0x000000000000000000000000${address.slice(2)}` as `0x${string}`;
}

/**
 * Parse burn transaction to extract message and nonce
 */
export interface BurnTxParsed {
  messageBytes: `0x${string}`;
  messageHash: `0x${string}`;
  nonce: bigint;
}

