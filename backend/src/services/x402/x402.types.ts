// x402.types.ts - Minimal types for x402 integration

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PaymentReceipt {
  intentId: string;
  transactionHash?: string;
  status: 'success' | 'failed';
  amount: number;
  timestamp: Date;
}

export interface X402FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface X402Response<T = any> {
  data: T;
  receipt?: PaymentReceipt;
}

