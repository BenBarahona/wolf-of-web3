// users.service.ts
import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, WalletPreference, UserActivity } from '../../entities';

export type AuthProvider = 'circle' | 'farcaster' | 'world' | 'web';

export interface CreateOrUpdateUserParams {
  provider: AuthProvider;
  email?: string;
  username?: string;
  circleUserId?: string;
  farcasterFid?: string;
  worldUserId?: string;
  primaryWalletAddress?: string;
}

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

  /**
   * ⚠️ Legacy: usado por el flujo actual de Circle (WalletController).
   * Internamente ahora delega al método genérico multi-host.
   */
  async createUser(
    circleUserId: string,
    email?: string,
    username?: string,
  ): Promise<User> {
    return this.createOrUpdateFromAuth({
      provider: 'circle',
      circleUserId,
      email,
      username,
    });
  }

  /**
   * ✅ Nuevo: crear o actualizar usuario a partir de cualquier proveedor (Circle/Farcaster/World/Web).
   */
  async createOrUpdateFromAuth(params: CreateOrUpdateUserParams): Promise<User> {
    const {
      provider,
      email,
      username,
      circleUserId,
      farcasterFid,
      worldUserId,
      primaryWalletAddress,
    } = params;

    let user: User | null = null;

    // 1) Intentamos encontrar al usuario por los IDs más fuertes
    if (circleUserId) {
      user = await this.userRepository.findOne({ where: { circleUserId } });
    }

    if (!user && farcasterFid) {
      user = await this.userRepository.findOne({ where: { farcasterFid } });
    }

    if (!user && worldUserId) {
      user = await this.userRepository.findOne({ where: { worldUserId } });
    }

    if (!user && primaryWalletAddress) {
      user = await this.userRepository.findOne({
        where: { primaryWalletAddress: primaryWalletAddress.toLowerCase() },
      });
    }

    // 2) Si existe, lo actualizamos con data que falte
    if (user) {
      let needsSave = false;

      if (!user.circleUserId && circleUserId) {
        user.circleUserId = circleUserId;
        needsSave = true;
      }

      if (!user.farcasterFid && farcasterFid) {
        user.farcasterFid = farcasterFid;
        needsSave = true;
      }

      if (!user.worldUserId && worldUserId) {
        user.worldUserId = worldUserId;
        needsSave = true;
      }

      if (!user.primaryWalletAddress && primaryWalletAddress) {
        user.primaryWalletAddress = primaryWalletAddress.toLowerCase();
        needsSave = true;
      }

      if (!user.email && email) {
        // check de email duplicado
        const emailExists = await this.userRepository.findOne({
          where: { email },
        });
        if (emailExists && emailExists.id !== user.id) {
          throw new ConflictException('Email already in use');
        }
        user.email = email;
        needsSave = true;
      }

      if (!user.username && username) {
        user.username = username;
        needsSave = true;
      }

      if (needsSave) {
        user = await this.userRepository.save(user);
      }

      await this.logActivity(user.id, 'user_login', {
        provider,
      });

      this.logger.log(
        `User updated from ${provider} auth: ${user.id} (${user.email || user.username || ''})`,
      );

      return user;
    }

    // 3) Si no existe, creamos uno nuevo
    if (email) {
      const emailExists = await this.userRepository.findOne({
        where: { email },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    const newUser = this.userRepository.create({
      circleUserId: circleUserId || null,
      farcasterFid: farcasterFid || null,
      worldUserId: worldUserId || null,
      primaryWalletAddress: primaryWalletAddress
        ? primaryWalletAddress.toLowerCase()
        : null,
      email: email || null,
      username: username || null,
      status: 'active',
      preferences: {},
    });

    const savedUser = await this.userRepository.save(newUser);
    this.logger.log(
      `User created from ${provider} auth: ${savedUser.id} (${savedUser.email || savedUser.username || ''})`,
    );

    await this.logActivity(savedUser.id, 'user_created', {
      provider,
      circleUserId,
      farcasterFid,
      worldUserId,
      primaryWalletAddress,
    });

    return savedUser;
  }

  // -------- Finders por distintos IDs / campos --------

  async findByCircleUserId(circleUserId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { circleUserId },
      relations: ['walletPreferences'],
    });
  }

  async findByFarcasterFid(farcasterFid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { farcasterFid },
      relations: ['walletPreferences'],
    });
  }

  async findByWorldUserId(worldUserId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { worldUserId },
      relations: ['walletPreferences'],
    });
  }

  async findByPrimaryWalletAddress(address: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { primaryWalletAddress: address.toLowerCase() },
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

    user.preferences = { ...(user.preferences || {}), ...preferences };
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
    } catch (error: any) {
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


