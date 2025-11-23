import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';

export interface CreateTransactionParams {
  userId: string;
  transactionHash: string;
  transactionType: string;
  blockchain: string;
  contractAddress?: string;
  amount?: string;
  tokenSymbol?: string;
  fromAddress?: string;
  toAddress?: string;
  walletId?: string;
  metadata?: any;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(params: CreateTransactionParams): Promise<Transaction> {
    try {
      const transaction = this.transactionRepository.create({
        userId: params.userId,
        transactionHash: params.transactionHash,
        transactionType: params.transactionType,
        blockchain: params.blockchain,
        contractAddress: params.contractAddress || null,
        amount: params.amount || null,
        tokenSymbol: params.tokenSymbol || null,
        fromAddress: params.fromAddress || null,
        toAddress: params.toAddress || null,
        walletId: params.walletId || null,
        metadata: params.metadata || {},
        status: 'pending',
      });

      const saved = await this.transactionRepository.save(transaction);
      this.logger.log(`Transaction created: ${saved.id} (${saved.transactionHash})`);
      return saved;
    } catch (error: any) {
      this.logger.error(`Failed to create transaction: ${error.message}`);
      throw error;
    }
  }

  async updateTransactionStatus(
    transactionHash: string,
    status: string,
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { transactionHash },
      });

      if (!transaction) {
        this.logger.warn(`Transaction not found: ${transactionHash}`);
        return null;
      }

      transaction.status = status;
      if (status === 'confirmed') {
        transaction.confirmedAt = new Date();
      }

      return await this.transactionRepository.save(transaction);
    } catch (error: any) {
      this.logger.error(`Failed to update transaction status: ${error.message}`);
      throw error;
    }
  }

  async getUserTransactions(
    userId: string,
    limit: number = 50,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getTransactionByHash(
    transactionHash: string,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { transactionHash },
    });
  }

  async getUserTransactionsByType(
    userId: string,
    transactionType: string,
    limit: number = 50,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { userId, transactionType },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}

