import { Injectable } from '@nestjs/common';
import { X402Client } from '../x402.client';
import { PaymentReceipt } from '../x402.types';

@Injectable()
export class X402Service {
  private client: X402Client;

  constructor() {
    this.client = new X402Client();
  }
  async payUsingX402(
    agentName: string,
    cost: number,
    payload?: any,
  ): Promise<{ success: boolean; receipt: PaymentReceipt }> {
    try {
      console.log(`[X402Service] Processing payment for ${agentName}, cost: ${cost}`);

      const intent = await this.client.createPaymentIntent(agentName, cost, payload);

      const { receipt } = await this.client.fetchPaid(
        `${process.env.X402_AGENT_ENDPOINT || 'https://api.agents.local'}/${agentName}`,
        intent.id,
        { body: payload },
      );

      const verified = await this.client.verifyPayment(intent.id);

      if (!verified) {
        throw new Error('Payment verification failed');
      }

      console.log(`[X402Service] Payment successful for ${agentName}`);
      return { success: true, receipt };
    } catch (error) {
      console.error(`[X402Service] Payment failed:`, error);
      throw error;
    }
  }
}
