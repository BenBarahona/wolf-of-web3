import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, WalletPreference, UserActivity } from '../../entities';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(WalletPreference)
    private walletPreferenceRepository: Repository<WalletPreference>,
    @InjectRepository(UserActivity)
    private activityRepository: Repository<UserActivity>,
  ) {}

  async createUser(
    circleUserId: string,
    email?: string,
    username?: string,
  ): Promise<User> {
    try {
      // Check if user with this Circle ID already exists
      const existingUser = await this.userRepository.findOne({
        where: { circleUserId },
      });

      if (existingUser) {
        this.logger.warn(`User with Circle ID ${circleUserId} already exists`);
        return existingUser;
      }

      // Check if email is already taken
      if (email) {
        const emailExists = await this.userRepository.findOne({ where: { email } });
        if (emailExists) {
          throw new ConflictException('Email already in use');
        }
      }

      const user = this.userRepository.create({
        circleUserId,
        email,
        username,
        status: 'active',
        preferences: {},
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log(`User created: ${savedUser.id}`);

      await this.logActivity(savedUser.id, 'user_created', {
        circleUserId,
      });

      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }

  async findByCircleUserId(circleUserId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { circleUserId },
      relations: ['walletPreferences'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['walletPreferences'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['walletPreferences', 'tradingStrategies'],
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLogin: new Date(),
    });

    await this.logActivity(userId, 'login');
  }

  async updatePreferences(userId: string, preferences: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.preferences = { ...user.preferences, ...preferences };
    return this.userRepository.save(user);
  }

  async saveWalletPreference(
    userId: string,
    walletId: string,
    nickname?: string,
    isPrimary?: boolean,
  ): Promise<WalletPreference> {
    // Check if preference already exists
    let preference = await this.walletPreferenceRepository.findOne({
      where: { userId, walletId },
    });

    if (preference) {
      if (nickname !== undefined) preference.nickname = nickname;
      if (isPrimary !== undefined) {
        if (isPrimary) {
          await this.walletPreferenceRepository.update(
            { userId, isPrimary: true },
            { isPrimary: false },
          );
        }
        preference.isPrimary = isPrimary;
      }
    } else {
      preference = this.walletPreferenceRepository.create({
        userId,
        walletId,
        nickname,
        isPrimary: isPrimary || false,
      });
    }

    const saved = await this.walletPreferenceRepository.save(preference);
    await this.logActivity(userId, 'wallet_preference_updated', {
      walletId,
      nickname,
      isPrimary,
    });

    return saved;
  }

  async getWalletPreferences(userId: string): Promise<WalletPreference[]> {
    return this.walletPreferenceRepository.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async logActivity(
    userId: string,
    actionType: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const activity = this.activityRepository.create({
        userId,
        actionType,
        metadata,
        ipAddress,
        userAgent,
      });

      await this.activityRepository.save(activity);
    } catch (error) {
      this.logger.error(`Failed to log activity: ${error.message}`);
    }
  }

  async getUserActivities(
    userId: string,
    limit: number = 50,
  ): Promise<UserActivity[]> {
    return this.activityRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}

