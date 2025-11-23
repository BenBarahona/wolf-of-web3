// user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WalletPreference } from './wallet-preference.entity';
import { TradingStrategy } from './trading-strategy.entity';
import { UserActivity } from './user-activity.entity';
import { Transaction } from './transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  username: string | null;

  // 🔑 Circle ahora es opcional: no todos los usuarios van a venir de Circle
  @Column({ name: 'circle_user_id', type: 'uuid', unique: true, nullable: true })
  circleUserId: string | null;

  // 🔑 Nuevos identificadores por host
  @Column({ name: 'farcaster_fid', type: 'varchar', length: 100, nullable: true })
  farcasterFid: string | null;

  @Column({ name: 'world_user_id', type: 'varchar', length: 100, nullable: true })
  worldUserId: string | null;

  @Column({ name: 'primary_wallet_address', type: 'varchar', length: 255, nullable: true })
  primaryWalletAddress: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @OneToMany(() => WalletPreference, (pref) => pref.user)
  walletPreferences: WalletPreference[];

  @OneToMany(() => TradingStrategy, (strategy) => strategy.user)
  tradingStrategies: TradingStrategy[];

  @OneToMany(() => UserActivity, (activity) => activity.user)
  activities: UserActivity[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];
}
