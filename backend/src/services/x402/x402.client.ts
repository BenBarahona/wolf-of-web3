import { PaymentIntent, PaymentReceipt, X402FetchOptions } from './x402.types';

export class X402Client {
  constructor() {}


  async createPaymentIntent(
    agentName: string,
    cost: number,
    metadata?: any,
  ): Promise<PaymentIntent> {
    
    const intent: PaymentIntent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: cost,
      currency: 'USDC',
      status: 'pending',
      createdAt: new Date(),
    };

    console.log(`[X402Client] Created payment intent for ${agentName}:`, intent);
    return intent;
  }

  async fetchPaid<T = any>(
    url: string,
    intentId: string,
    options?: X402FetchOptions,
  ): Promise<{ data: T; receipt: PaymentReceipt }> {
    console.log(`[X402Client] Executing paid fetch to ${url} with intent ${intentId}`);

    const receipt: PaymentReceipt = {
      intentId,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'success',
      amount: 0.1,
      timestamp: new Date(),
    };

    const data = {
      success: true,
      message: 'Paid request executed successfully (simulated)',
      ...options?.body,
    } as T;

    return { data, receipt };
  }

  async verifyPayment(intentId: string): Promise<boolean> {
    console.log(`[X402Client] Verifying payment for intent ${intentId}`);
    // testing - returning true always
    return true;
  }

  async getPaymentStatus(intentId: string): Promise<'pending' | 'completed' | 'failed'> {
    console.log(`[X402Client] Getting payment status for ${intentId}`);
    // hardcodded for now
    return 'completed';
  }
}

