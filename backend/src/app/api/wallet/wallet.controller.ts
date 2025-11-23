// src/app/api/wallet/wallet.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import {
  CircleService,
  CreateUserResponse,
  CreateWalletResponse,
  User as CircleUser,
} from '../../../services/circle/circle/circle.service';
import { UsersService } from '../../../services/users/users.service';

interface CreateUserDto {
  userId?: string;
  email?: string;
  username?: string;
}

interface CreateWalletDto {
  blockchain?: string;
  accountType?: 'SCA' | 'EOA';
}

interface CreateTransactionDto {
  walletId: string;
  destinationAddress: string;
  amount: string;
  tokenId?: string;
}

interface AcquireTokenDto {
  userId: string;
}

@Controller('api/wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(
    private readonly circleService: CircleService,
    private readonly usersService: UsersService,
  ) {}

  @Get('config')
  async getConfig() {
    try {
      const appId = this.circleService.getAppId();
      return {
        success: true,
        data: {
          appId,
        },
      };
    } catch (error: any) {
      this.logger.error('Error getting config:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('user/create')
  async createUser(
    @Body() body: CreateUserDto,
    @Req() req: any,
  ): Promise<{ success: boolean; data: CreateUserResponse & { dbUserId: string } }> {
    try {
      // Create user in Circle
      const circleResult = await this.circleService.createUser(body.userId);

      // Storing in db (legacy Circle flow)
      const dbUser = await this.usersService.createUser(
        circleResult.userId,
        body.email,
        body.username,
      );

      await this.usersService.logActivity(
        dbUser.id,
        'circle_user_created',
        {
          circleUserId: circleResult.userId,
        },
        req.ip,
        req.headers['user-agent'],
      );

      return {
        success: true,
        data: {
          ...circleResult,
          dbUserId: dbUser.id,
        },
      };
    } catch (error: any) {
      this.logger.error('Error creating user:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('user/login')
  async loginUser(
    @Body() body: { email: string },
    @Req() req: any,
  ): Promise<{
    success: boolean;
    data: {
      userId: string;
      userToken: string;
      encryptionKey: string;
      challengeId: string;
    };
  }> {
    try {
      if (!body.email) {
        throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
      }

      const dbUser = await this.usersService.findByEmail(body.email);

      if (!dbUser) {
        throw new HttpException(
          'No account found with this email',
          HttpStatus.NOT_FOUND,
        );
      }

      // Este endpoint es específico del flujo Circle:
      // nos aseguramos de que el usuario tenga circleUserId
      const circleUserId = dbUser.circleUserId;
      if (!circleUserId) {
        throw new HttpException(
          'User does not have a Circle account configured',
          HttpStatus.BAD_REQUEST,
        );
      }

      // We need a new session token from Circle
      const sessionData = await this.circleService.acquireSessionToken(
        circleUserId,
      );

      // For login, we use restorePin to verify the existing PIN (not initializeUser)
      const challengeId = await this.circleService.restorePin(
        sessionData.userToken,
      );

      await this.usersService.updateLastLogin(dbUser.id);

      await this.usersService.logActivity(
        dbUser.id,
        'user_login',
        {
          email: body.email,
        },
        req.ip,
        req.headers['user-agent'],
      );

      return {
        success: true,
        data: {
          userId: circleUserId,
          userToken: sessionData.userToken,
          encryptionKey: sessionData.encryptionKey,
          challengeId: challengeId,
        },
      };
    } catch (error: any) {
      this.logger.error('Error logging in user:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to log in',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('user/social/token')
  async createSocialLoginToken(
    @Body() body: { deviceId: string },
  ): Promise<{
    success: boolean;
    data: {
      deviceToken: string;
      deviceEncryptionKey: string;
    };
  }> {
    try {
      if (!body.deviceId) {
        throw new HttpException('Device ID is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Creating social login token for deviceId: ${body.deviceId}`);

      const result = await this.circleService.createDeviceTokenForSocialLogin(
        body.deviceId,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('Error creating social login token:', error);

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to create social login token',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('user/token')
  async acquireToken(@Body() body: AcquireTokenDto) {
    try {
      const result = await this.circleService.acquireSessionToken(body.userId);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('Error acquiring token:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('user/initialize')
  async initializeUser(
    @Headers('x-user-token') userToken: string,
    @Body() body: { accountType?: 'SCA' | 'EOA'; blockchains?: string[] },
  ) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const challengeId = await this.circleService.initializeUser(
        userToken,
        body.accountType || 'SCA',
        body.blockchains || ['ARC-TESTNET'],
      );
      return {
        success: true,
        data: {
          challengeId,
        },
      };
    } catch (error: any) {
      this.logger.error('Error initializing user:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('challenge')
  async createChallenge(@Headers('x-user-token') userToken: string) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const challengeId = await this.circleService.createChallenge(userToken);
      return {
        success: true,
        data: {
          challengeId,
        },
      };
    } catch (error: any) {
      this.logger.error('Error creating challenge:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('wallet/create')
  async createWallet(
    @Headers('x-user-token') userToken: string,
    @Body() body: CreateWalletDto,
  ): Promise<{ success: boolean; data: CreateWalletResponse }> {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.circleService.createWallet(
        userToken,
        body.blockchain || 'ARC-TESTNET',
        body.accountType || 'SCA',
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('Error creating wallet:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/status')
  async getUserStatus(
    @Headers('x-user-token') userToken: string,
  ): Promise<{ success: boolean; data: CircleUser }> {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.circleService.getUserStatus(userToken);
      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      this.logger.error('Error getting user status:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('wallets')
  async listWallets(@Headers('x-user-token') userToken: string) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const wallets = await this.circleService.listWallets(userToken);
      return {
        success: true,
        data: {
          wallets,
        },
      };
    } catch (error: any) {
      this.logger.error('Error listing wallets:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('wallet/balance')
  async getWalletBalance(
    @Headers('x-user-token') userToken: string,
    @Body() body: { walletId: string },
  ) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const balances = await this.circleService.getWalletBalance(
        userToken,
        body.walletId,
      );

      return {
        success: true,
        data: {
          balances,
        },
      };
    } catch (error: any) {
      this.logger.error('Error getting wallet balance:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('user/pin/restore')
  async restorePin(@Headers('x-user-token') userToken: string) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const challengeId = await this.circleService.restorePin(userToken);
      return {
        success: true,
        data: {
          challengeId,
        },
      };
    } catch (error: any) {
      this.logger.error('Error restoring PIN:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('transaction/create')
  async createTransaction(
    @Headers('x-user-token') userToken: string,
    @Body() body: CreateTransactionDto,
  ) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.circleService.createTransaction(
        userToken,
        body.walletId,
        body.destinationAddress,
        body.amount,
        body.tokenId,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('Error creating transaction:', error);
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
