import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface CreateUserResponse {
  userId: string;
  userToken: string;
  encryptionKey: string;
  challengeId: string;
}

export interface CreateWalletResponse {
  walletId: string;
  address: string;
  blockchain: string;
  state: string;
}

export interface User {
  id: string;
  createDate: string;
  updateDate: string;
  status: string;
  pinStatus: string;
  securityQuestionStatus: string;
}

@Injectable()
export class CircleService {
  private readonly logger = new Logger(CircleService.name);
  private readonly apiKey: string;
  private readonly appId: string;
  private readonly baseUrl = 'https://api.circle.com/v1/w3s';
  private readonly client: any;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CIRCLE_API_KEY') || '';
    this.appId = this.configService.get<string>('CIRCLE_APP_ID') || '';

    if (!this.apiKey) {
      this.logger.warn('CIRCLE_API_KEY not found in environment variables');
    }

    if (!this.appId) {
      this.logger.warn('CIRCLE_APP_ID not found in environment variables');
    }

    this.client = initiateDeveloperControlledWalletsClient({
      apiKey: this.apiKey,
      entitySecret: this.configService.get<string>('CIRCLE_ENTITY_SECRET') || '',
    });
  }

  getAppId(): string {
    return this.appId;
  }

  async createUser(userId?: string): Promise<CreateUserResponse> {
    try {
      const requestId = uuidv4();
      const actualUserId = userId || uuidv4();

      this.logger.log(`Creating user with ID: ${actualUserId}`);

      const response = await axios.post(
        `${this.baseUrl}/users`,
        {
          userId: actualUserId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'X-Request-Id': requestId,
          },
        },
      );

      const userData = response.data.data;
      
      // Debug: Log the actual response structure
      this.logger.debug('Circle API Response:', JSON.stringify(userData, null, 2));
      
      // Handle different possible response structures
      const createdUserId = userData?.user?.id || userData?.id || actualUserId;
      this.logger.log(`User created successfully: ${createdUserId}`);

      const sessionToken = await this.acquireSessionToken(actualUserId);

      // Initialize the user account to get the PIN setup challenge
      const challengeId = await this.initializeUser(
        sessionToken.userToken,
        'SCA',
        ['ARC-TESTNET'],
      );
      
      return {
        userId: createdUserId,
        userToken: sessionToken.userToken,
        encryptionKey: sessionToken.encryptionKey,
        challengeId: challengeId,
      };
    } catch (error: any) {
      this.logger.error('Error creating user:', error.response?.data || error);
      throw new Error(
        `Failed to create user: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async acquireSessionToken(userId: string): Promise<{
    userToken: string;
    encryptionKey: string;
  }> {
    try {
      this.logger.log(`Acquiring session token for user: ${userId}`);

      const response = await axios.post(
        `${this.baseUrl}/users/token`,
        {
          userId: userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const data = response.data.data;
      this.logger.log('Session token acquired successfully');
      this.logger.debug('Session token response:', JSON.stringify(data, null, 2));

      return {
        userToken: data.userToken,
        encryptionKey: data.encryptionKey,
      };
    } catch (error: any) {
      this.logger.error(
        'Error acquiring session token:',
        error.response?.data || error,
      );
      throw new Error(
        `Failed to acquire session token: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async initializeUser(
    userToken: string,
    accountType: 'SCA' | 'EOA' = 'SCA',
    blockchains: string[] = ['ARC-TESTNET'],
  ): Promise<string> {
    try {
      this.logger.log(`Initializing user account with ${accountType} on ${blockchains.join(', ')}`);

      const response = await axios.post(
        `${this.baseUrl}/user/initialize`,
        {
          idempotencyKey: uuidv4(),
          accountType: accountType,
          blockchains: blockchains,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'X-User-Token': userToken,
          },
        },
      );

      const challengeId = response.data.data.challengeId;
      this.logger.log(`User initialized, challenge created: ${challengeId}`);
      this.logger.debug('Initialize response:', JSON.stringify(response.data.data, null, 2));

      return challengeId;
    } catch (error: any) {
      this.logger.error(
        'Error initializing user:',
        JSON.stringify(error.response?.data || error.message, null, 2),
      );
      this.logger.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(
        `Failed to initialize user: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async createChallenge(
    userToken: string,
    challengeType: string = 'SET_PIN',
  ): Promise<string> {
    // Deprecated: Use initializeUser instead for PIN setup
    // This method is kept for backwards compatibility
    return this.initializeUser(userToken, 'SCA', ['ARC-TESTNET']);
  }

  async createWallet(
    userToken: string,
    blockchain: string = 'ARC-TESTNET',
    accountType: 'SCA' | 'EOA' = 'SCA',
  ): Promise<CreateWalletResponse> {
    try {
      this.logger.log(
        `Creating ${accountType} wallet on ${blockchain} blockchain`,
      );

      const walletSetResponse = await axios.post(
        `${this.baseUrl}/user/wallets/sets`,
        {
          name: `Wolf of Web3 Wallet`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'X-User-Token': userToken,
          },
        },
      );

      const walletSetId = walletSetResponse.data.data.walletSet.id;
      this.logger.log(`Wallet set created: ${walletSetId}`);

      const walletResponse = await axios.post(
        `${this.baseUrl}/user/wallets`,
        {
          blockchains: [blockchain],
          count: 1,
          walletSetId: walletSetId,
          accountType: accountType,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'X-User-Token': userToken,
          },
        },
      );

      const responseData = walletResponse.data.data;
      const wallet = responseData.wallets[0];
      
      this.logger.log(`Wallet created: ${wallet.id} - ${wallet.address}`);
      this.logger.debug('Wallet creation response:', JSON.stringify(responseData, null, 2));

      return {
        walletId: wallet.id,
        address: wallet.address,
        blockchain: wallet.blockchain,
        state: wallet.state,
      };
    } catch (error: any) {
      this.logger.error(
        'Error creating wallet:',
        error.response?.data || error,
      );
      throw new Error(
        `Failed to create wallet: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getUserStatus(userToken: string): Promise<User> {
    try {
      this.logger.log('Getting user status');

      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'X-User-Token': userToken,
        },
      });

      return response.data.data.user;
    } catch (error: any) {
      this.logger.error(
        'Error getting user status:',
        error.response?.data || error,
      );
      throw new Error(
        `Failed to get user status: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async listWallets(userToken: string): Promise<any[]> {
    try {
      this.logger.log('Listing user wallets');

      const response = await axios.get(`${this.baseUrl}/wallets`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'X-User-Token': userToken,
        },
      });

      return response.data.data.wallets;
    } catch (error: any) {
      this.logger.error(
        'Error listing wallets:',
        error.response?.data || error,
      );
      throw new Error(
        `Failed to list wallets: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async getWalletBalance(
    userToken: string,
    walletId: string,
  ): Promise<any[]> {
    try {
      this.logger.log(`Getting balance for wallet: ${walletId}`);

      const response = await axios.get(
        `${this.baseUrl}/wallets/${walletId}/balances`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'X-User-Token': userToken,
          },
        },
      );

      return response.data.data.tokenBalances;
    } catch (error: any) {
      this.logger.error(
        'Error getting wallet balance:',
        error.response?.data || error,
      );
      throw new Error(
        `Failed to get wallet balance: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async restorePin(userToken: string): Promise<string> {
    try {
      this.logger.log('Creating restore PIN challenge');

      const response = await axios.post(
        `${this.baseUrl}/user/pin/restore`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'X-User-Token': userToken,
          },
        },
      );

      return response.data.data.challengeId;
    } catch (error: any) {
      this.logger.error('Error restoring PIN:', error.response?.data || error);
      throw new Error(
        `Failed to restore PIN: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  async createTransaction(
    userToken: string,
    walletId: string,
    destinationAddress: string,
    amount: string,
    tokenId?: string,
  ): Promise<{ challengeId: string; transactionId: string }> {
    try {
      this.logger.log(
        `Creating transaction from wallet ${walletId} to ${destinationAddress}`,
      );

      const response = await axios.post(
        `${this.baseUrl}/user/transactions/transfer`,
        {
          walletId,
          destinationAddress,
          amounts: [amount],
          tokenId: tokenId || undefined,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'X-User-Token': userToken,
          },
        },
      );

      const data = response.data.data;
      this.logger.log(`Transaction created: ${data.id}`);

      return {
        challengeId: data.challengeId,
        transactionId: data.id,
      };
    } catch (error: any) {
      this.logger.error(
        'Error creating transaction:',
        error.response?.data || error,
      );
      throw new Error(
        `Failed to create transaction: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
