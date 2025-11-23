/**
 * CCTP Bridge Service
 * Handles cross-chain USDC transfers using Circle's CCTP directly
 * Works with Circle Programmable Wallets (PIN-based signing)
 */

import { createPublicClient, http, type Hash } from 'viem';
import { 
  SUPPORTED_CHAINS, 
  getChainById, 
  getUSDCAddress, 
  type SupportedChainId 
} from './chains.config';
import {
  TOKEN_MESSENGER_ADDRESSES,
  MESSAGE_TRANSMITTER_ADDRESSES,
  CCTP_DOMAINS,
  TOKEN_MESSENGER_ABI,
  MESSAGE_TRANSMITTER_ABI,
  CIRCLE_ATTESTATION_API,
  CURRENT_ENV,
  addressToBytes32,
} from './cctp.config';

export interface BridgeTransferParams {
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  amount: string;
  senderAddress: `0x${string}`;
  recipientAddress: `0x${string}`;
}

export interface BridgeTransferStatus {
  attestationHash?: string;
  transactionHash?: string;
  messageHash?: string;
  status: 'pending' | 'attested' | 'completed' | 'failed';
  message?: string;
}

export interface AttestationResponse {
  status: string;
  attestation?: string;
}

/**
 * Get attestation from Circle's API
 * This is called after the burn transaction is confirmed
 */
async function getAttestation(messageHash: string): Promise<AttestationResponse> {
  const url = `${CIRCLE_ATTESTATION_API[CURRENT_ENV]}/v1/attestations/${messageHash}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Attestation API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch attestation:', error);
    throw error;
  }
}

/**
 * Step 1: Prepare burn transaction on source chain
 * This function prepares the transaction data for Circle Wallet to sign
 * 
 * Note: The actual transaction is executed by Circle SDK with user's PIN
 * This returns the transaction request that needs to be signed
 */
export function prepareBurnTransaction(params: BridgeTransferParams) {
  const {
    sourceChainId,
    destinationChainId,
    amount,
    recipientAddress,
  } = params;

  const tokenMessenger = TOKEN_MESSENGER_ADDRESSES[sourceChainId];
  const usdcAddress = getUSDCAddress(sourceChainId);
  
  const destinationDomain = CCTP_DOMAINS[destinationChainId];
  
  const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1_000_000));
  
  const mintRecipient = addressToBytes32(recipientAddress);

  return {
    to: tokenMessenger,
    abi: TOKEN_MESSENGER_ABI,
    functionName: 'depositForBurn',
    args: [amountInWei, destinationDomain, mintRecipient, usdcAddress],
    value: BigInt(0),
  };
}

/**
 * Initiate a bridge transfer
 * Returns the transaction request for Circle SDK to execute
 * 
 * NOTE: In your app, you'll need to:
 * 1. Call this to get the tx data
 * 2. Use Circle SDK to execute the transaction (user signs with PIN)
 * 3. Wait for confirmation
 * 4. Extract message hash from logs
 * 5. Poll for attestation
 */
export async function initiateBridgeTransfer(
  params: BridgeTransferParams
): Promise<{ 
  transactionRequest: any;
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
}> {
  try {
    const txRequest = prepareBurnTransaction(params);
    
    return {
      transactionRequest: txRequest,
      sourceChainId: params.sourceChainId,
      destinationChainId: params.destinationChainId,
    };
  } catch (error) {
    console.error('Bridge transfer preparation error:', error);
    throw new Error(`Failed to prepare bridge transfer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse burn transaction logs to extract message hash
 * This is needed to request attestation from Circle
 */
export async function extractMessageHashFromBurnTx(
  txHash: Hash,
  sourceChainId: SupportedChainId
): Promise<string> {
  const sourceChain = getChainById(sourceChainId);
  if (!sourceChain) {
    throw new Error('Invalid source chain');
  }

  const publicClient = createPublicClient({
    chain: sourceChain,
    transport: http(),
  });

  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    // Look for MessageSent event from MessageTransmitter
    // Event signature: MessageSent(bytes message)
    const messageSentEvent = receipt.logs.find(
      (log) => log.topics[0] === '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036'
    );

    if (!messageSentEvent) {
      throw new Error('MessageSent event not found in transaction logs');
    }

    // The message hash is in topics[1]
    const messageHash = messageSentEvent.topics[1];
    
    if (!messageHash) {
      throw new Error('Message hash not found in event');
    }

    return messageHash;
  } catch (error) {
    console.error('Failed to extract message hash:', error);
    throw error;
  }
}

/**
 * Check transfer status by polling Circle's attestation API
 */
export async function checkBridgeStatus(
  messageHash: string,
  destinationChainId: SupportedChainId
): Promise<BridgeTransferStatus> {
  try {
    const attestationData = await getAttestation(messageHash);

    if (attestationData.status === 'complete' && attestationData.attestation) {
      return {
        messageHash,
        attestationHash: attestationData.attestation,
        status: 'attested',
        message: 'Attestation received! Ready to mint on destination chain',
      };
    } else if (attestationData.status === 'pending_confirmations') {
      return {
        messageHash,
        status: 'pending',
        message: 'Waiting for source chain confirmations',
      };
    } else {
      return {
        messageHash,
        status: 'pending',
        message: 'Processing attestation',
      };
    }
  } catch (error) {
    console.error('Status check error:', error);
    return {
      messageHash,
      status: 'pending',
      message: error instanceof Error ? error.message : 'Checking status...',
    };
  }
}

/**
 * Step 2: Prepare receive transaction on destination chain
 * After receiving attestation, call this to mint USDC on destination
 * 
 * Returns transaction data for Circle Wallet to sign
 */
export function prepareReceiveTransaction(
  messageBytes: `0x${string}`,
  attestation: string,
  destinationChainId: SupportedChainId
) {
  const messageTransmitter = MESSAGE_TRANSMITTER_ADDRESSES[destinationChainId];

  return {
    to: messageTransmitter,
    abi: MESSAGE_TRANSMITTER_ABI,
    functionName: 'receiveMessage',
    args: [messageBytes, attestation],
    value: BigInt(0),
  };
}

export function estimateTransferTime(
  sourceChainId: SupportedChainId,
  destinationChainId: SupportedChainId
): string {
  // Typical CCTP transfer times:
  // - Source chain confirmation: 5-10 minutes
  // - Attestation: 2-5 minutes
  // - Destination chain minting: 5-10 minutes
  return '15-25 minutes';
}

/**
 * Estimate bridge fees (CCTP has minimal fees, just gas)
 */
export function estimateBridgeFee(amount: string): string {
  return '~0.01 USDC (gas only)';
}

export function getSupportedRoutes(): Array<{
  from: SupportedChainId;
  to: SupportedChainId;
  fromName: string;
  toName: string;
}> {
  const routes: Array<{
    from: SupportedChainId;
    to: SupportedChainId;
    fromName: string;
    toName: string;
  }> = [];

  SUPPORTED_CHAINS.forEach((sourceChain) => {
    SUPPORTED_CHAINS.forEach((destChain) => {
      if (sourceChain.id !== destChain.id) {
        routes.push({
          from: sourceChain.id,
          to: destChain.id,
          fromName: sourceChain.name,
          toName: destChain.name,
        });
      }
    });
  });

  return routes;
}

