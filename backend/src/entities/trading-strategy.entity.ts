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

@Entity('trading_strategies')
export class TradingStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'wallet_id', type: 'varchar', length: 255 })
  walletId: string;

  @Column({ name: 'strategy_name', type: 'varchar', length: 100 })
  strategyName: string;

  @Column({ name: 'strategy_type', type: 'varchar', length: 50 })
  strategyType: string;

  @Column({ name: 'strategy_config', type: 'jsonb' })
  strategyConfig: any;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, default: 'stopped' })
  status: string; // 'active', 'paused', 'stopped'

  @Column({ name: 'risk_level', type: 'varchar', length: 20, nullable: true })
  riskLevel: string | null; // 'low', 'medium', 'high'

  @Column({ name: 'total_invested', type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalInvested: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 20, scale: 8, default: 0 })
  currentValue: number;

  @Column({ name: 'last_executed_at', type: 'timestamp', nullable: true })
  lastExecutedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tradingStrategies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

