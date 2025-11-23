import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { UsersService } from '../../../services/users/users.service';
import { UserPreferencesService } from '../../../services/users/user-preferences.service';
import { CircleService } from '../../../services/circle/circle/circle.service';
import { TransactionsService } from '../../../services/transactions/transactions.service';

@Controller('api/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly circleService: CircleService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('activities')
  async getActivities(
    @Headers('x-user-token') userToken: string,
    @Query('limit') limit?: string,
  ) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Decode the JWT token to get the Circle user ID
      // The userToken is a JWT where the 'sub' claim contains the Circle user ID
      let circleUserId: string;
      try {
        const tokenParts = userToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString('utf-8')
        );
        
        circleUserId = payload.sub;
        
        if (!circleUserId) {
          throw new Error('No sub claim in token');
        }
        
        this.logger.debug(`Decoded Circle user ID from token: ${circleUserId}`);
      } catch (decodeError: any) {
        this.logger.error('Failed to decode user token:', decodeError.message);
        throw new HttpException('Invalid user token', HttpStatus.UNAUTHORIZED);
      }

      // Find the DB user by Circle user ID
      this.logger.debug(`Looking up DB user with Circle ID: ${circleUserId}`);
      const dbUser = await this.usersService.findByCircleUserId(circleUserId);
      if (!dbUser) {
        this.logger.warn(`DB user not found for Circle user ID: ${circleUserId}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const activityLimit = limit ? parseInt(limit) : 50;
      const activities = await this.usersService.getUserActivities(
        dbUser.id,
        activityLimit,
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error: any) {
      this.logger.error('Error getting activities:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get activities',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('transactions')
  async getTransactions(
    @Headers('x-user-token') userToken: string,
    @Query('limit') limit?: string,
  ) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Decode the JWT token to get the Circle user ID
      let circleUserId: string;
      try {
        const tokenParts = userToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString('utf-8')
        );
        
        circleUserId = payload.sub;
        
        if (!circleUserId) {
          throw new Error('No sub claim in token');
        }
      } catch (decodeError: any) {
        this.logger.error('Failed to decode user token:', decodeError.message);
        throw new HttpException('Invalid user token', HttpStatus.UNAUTHORIZED);
      }

      // Find the DB user by Circle user ID
      const dbUser = await this.usersService.findByCircleUserId(circleUserId);
      if (!dbUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Get transactions
      const transactionLimit = limit ? parseInt(limit) : 50;
      const transactions = await this.transactionsService.getUserTransactions(
        dbUser.id,
        transactionLimit,
      );

      return {
        success: true,
        data: transactions,
      };
    } catch (error: any) {
      this.logger.error('Error getting transactions:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get transactions',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('preferences')
  async savePreferences(
    @Headers('x-user-token') userToken: string,
    @Body() body: {
      investmentPreferences?: string[];
      timeHorizon?: string;
      riskPreference?: string;
      selectedStrategy?: string;
    },
  ) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      let circleUserId: string;
      try {
        const tokenParts = userToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString('utf-8')
        );
        
        circleUserId = payload.sub;
        
        if (!circleUserId) {
          throw new Error('No sub claim in token');
        }
      } catch (decodeError: any) {
        this.logger.error('Failed to decode user token:', decodeError.message);
        throw new HttpException('Invalid user token', HttpStatus.UNAUTHORIZED);
      }

      const dbUser = await this.usersService.findByCircleUserId(circleUserId);
      if (!dbUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const preferences = await this.userPreferencesService.createOrUpdate({
        userId: dbUser.id,
        ...body,
      });

      return {
        success: true,
        data: preferences,
      };
    } catch (error: any) {
      this.logger.error('Error saving preferences:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to save preferences',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preferences')
  async getPreferences(@Headers('x-user-token') userToken: string) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      let circleUserId: string;
      try {
        const tokenParts = userToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString('utf-8')
        );
        
        circleUserId = payload.sub;
        
        if (!circleUserId) {
          throw new Error('No sub claim in token');
        }
      } catch (decodeError: any) {
        this.logger.error('Failed to decode user token:', decodeError.message);
        throw new HttpException('Invalid user token', HttpStatus.UNAUTHORIZED);
      }

      const dbUser = await this.usersService.findByCircleUserId(circleUserId);
      if (!dbUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const preferences = await this.userPreferencesService.findByUserId(dbUser.id);

      return {
        success: true,
        data: preferences,
      };
    } catch (error: any) {
      this.logger.error('Error getting preferences:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to get preferences',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('preferences/complete-onboarding')
  async completeOnboarding(@Headers('x-user-token') userToken: string) {
    try {
      if (!userToken) {
        throw new HttpException(
          'User token is required',
          HttpStatus.UNAUTHORIZED,
        );
      }

      let circleUserId: string;
      try {
        const tokenParts = userToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], 'base64').toString('utf-8')
        );
        
        circleUserId = payload.sub;
        
        if (!circleUserId) {
          throw new Error('No sub claim in token');
        }
      } catch (decodeError: any) {
        this.logger.error('Failed to decode user token:', decodeError.message);
        throw new HttpException('Invalid user token', HttpStatus.UNAUTHORIZED);
      }

      const dbUser = await this.usersService.findByCircleUserId(circleUserId);
      if (!dbUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Mark onboarding as completed
      const preferences = await this.userPreferencesService.completeOnboarding(dbUser.id);

      return {
        success: true,
        data: preferences,
      };
    } catch (error: any) {
      this.logger.error('Error completing onboarding:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: error.message || 'Failed to complete onboarding',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

