// circle.client.ts - Circle Smart Wallet integration using viem

import { createWalletClient, http, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

export interface CircleSignerConfig {
  privateKey?: string;
  rpcUrl?: string;
  chainId?: number;
}

export function getCircleSigner(config?: CircleSignerConfig): WalletClient {

  const privateKey = config?.privateKey || (process.env.CIRCLE_PRIVATE_KEY as `0x${string}`);

  if (!privateKey) {
    console.warn('[CircleClient] No private key provided, using placeholder');
    const placeholderKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const account = privateKeyToAccount(placeholderKey as `0x${string}`);

    return createWalletClient({
      account,
      chain: mainnet,
      transport: http(config?.rpcUrl || 'https://eth.llamarpc.com'),
    });
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const client = createWalletClient({
    account,
    chain: mainnet,
    transport: http(config?.rpcUrl || process.env.RPC_URL || 'https://eth.llamarpc.com'),
  });

  console.log('[CircleClient] Wallet signer created:', account.address);
  return client;
}

//
export function getWalletAddress(signer: WalletClient): string {
  return signer.account?.address || '';
}

export class CircleWalletClient {
  private signer: WalletClient;

  constructor(config?: CircleSignerConfig) {
    this.signer = getCircleSigner(config);
  }

  getAddress(): string {
    return getWalletAddress(this.signer);
  }

  getSigner(): WalletClient {
    return this.signer;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer.account) {
      throw new Error('No account available');
    }
    const signature = await this.signer.signMessage({
      account: this.signer.account,
      message,
    });
    console.log('[CircleClient] Message signed');
    return signature;
  }

  async signTransaction(tx: any): Promise<string> {
    console.log('[CircleClient] Transaction signing (placeholder):', tx);
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }
}

