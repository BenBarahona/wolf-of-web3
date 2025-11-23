// user-preferences.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreferences } from '../../entities/user-preferences.entity';

export interface CreateUserPreferencesDto {
  userId: string;
  investmentPreferences?: string[];
  timeHorizon?: string;
  riskPreference?: string;
  selectedStrategy?: string;
}

export interface UpdateUserPreferencesDto {
  investmentPreferences?: string[];
  timeHorizon?: string;
  riskPreference?: string;
  selectedStrategy?: string;
  onboardingCompleted?: boolean;
}

@Injectable()
export class UserPreferencesService {
  private readonly logger = new Logger(UserPreferencesService.name);

  constructor(
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
  ) {}

  async createOrUpdate(data: CreateUserPreferencesDto): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { userId: data.userId },
    });

    if (preferences) {
      preferences.investmentPreferences = data.investmentPreferences || preferences.investmentPreferences;
      preferences.timeHorizon = data.timeHorizon || preferences.timeHorizon;
      preferences.riskPreference = data.riskPreference || preferences.riskPreference;
      preferences.selectedStrategy = data.selectedStrategy || preferences.selectedStrategy;
    } else {
      preferences = this.preferencesRepository.create(data);
    }

    const saved = await this.preferencesRepository.save(preferences);
    this.logger.log(`User preferences saved for user: ${data.userId}`);
    return saved;
  }

  async update(userId: string, data: UpdateUserPreferencesDto): Promise<UserPreferences> {
    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      throw new NotFoundException('User preferences not found');
    }

    if (data.investmentPreferences !== undefined) {
      preferences.investmentPreferences = data.investmentPreferences;
    }
    if (data.timeHorizon !== undefined) {
      preferences.timeHorizon = data.timeHorizon;
    }
    if (data.riskPreference !== undefined) {
      preferences.riskPreference = data.riskPreference;
    }
    if (data.selectedStrategy !== undefined) {
      preferences.selectedStrategy = data.selectedStrategy;
    }
    if (data.onboardingCompleted !== undefined) {
      preferences.onboardingCompleted = data.onboardingCompleted;
    }

    const saved = await this.preferencesRepository.save(preferences);
    this.logger.log(`User preferences updated for user: ${userId}`);
    return saved;
  }

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    return this.preferencesRepository.findOne({
      where: { userId },
    });
  }

  async completeOnboarding(userId: string): Promise<UserPreferences> {
    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      throw new NotFoundException('User preferences not found');
    }

    preferences.onboardingCompleted = true;
    return this.preferencesRepository.save(preferences);
  }
  
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    return preferences?.onboardingCompleted || false;
  }
}

