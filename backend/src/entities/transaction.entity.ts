import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'transaction_hash', type: 'varchar', length: 255, unique: true })
  transactionHash: string;

  @Column({ name: 'transaction_type', type: 'varchar', length: 50 })
  transactionType: string; // 'deposit', 'withdraw', 'approve', 'transfer', etc.

  @Column({ type: 'varchar', length: 100 })
  blockchain: string;

  @Column({ name: 'contract_address', type: 'varchar', length: 255, nullable: true })
  contractAddress: string | null;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // 'pending', 'confirmed', 'failed'

  @Column({ type: 'decimal', precision: 30, scale: 6, nullable: true })
  amount: string | null;

  @Column({ name: 'token_symbol', type: 'varchar', length: 20, nullable: true })
  tokenSymbol: string | null;

  @Column({ name: 'from_address', type: 'varchar', length: 255, nullable: true })
  fromAddress: string | null;

  @Column({ name: 'to_address', type: 'varchar', length: 255, nullable: true })
  toAddress: string | null;

  @Column({ name: 'wallet_id', type: 'varchar', length: 255, nullable: true })
  walletId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

