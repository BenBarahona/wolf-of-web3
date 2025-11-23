// user-preferences.entity.ts
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

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'investment_preferences', type: 'jsonb', nullable: true })
  investmentPreferences: string[];

  @Column({ name: 'time_horizon', type: 'varchar', length: 50, nullable: true })
  timeHorizon: string | null;

  @Column({ name: 'risk_preference', type: 'varchar', length: 20, nullable: true })
  riskPreference: string | null;

  @Column({ name: 'selected_strategy', type: 'varchar', length: 50, nullable: true })
  selectedStrategy: string | null;

  @Column({ name: 'onboarding_completed', type: 'boolean', default: false })
  onboardingCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

