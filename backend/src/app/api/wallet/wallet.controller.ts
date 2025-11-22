import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  CircleService,
  CreateUserResponse,
  CreateWalletResponse,
  User,
} from '../../../services/circle/circle/circle.service';

interface CreateUserDto {
  userId?: string;
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

  constructor(private readonly circleService: CircleService) {}

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
  ): Promise<{ success: boolean; data: CreateUserResponse }> {
    try {
      const result = await this.circleService.createUser(body.userId);
      return {
        success: true,
        data: result,
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
  ): Promise<{ success: boolean; data: User }> {
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

