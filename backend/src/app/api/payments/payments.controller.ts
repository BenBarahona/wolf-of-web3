// payments.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { X402Service } from '../../../services/x402/x402/x402.service';

interface PaymentRequest {
  agentName: string;
  cost: number;
  payload?: any;
}

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly x402Service: X402Service) {}

  @Post('pay')
  async pay(@Body() request: PaymentRequest) {
    const { agentName, cost, payload } = request;

    if (!agentName || !cost) {
      return {
        success: false,
        error: 'Missing required fields: agentName and cost are required',
      };
    }

    try {
      const result = await this.x402Service.payUsingX402(agentName, cost, payload);
      return result;
    } catch (error) {
      console.error('[PaymentsController] Payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  }
}

