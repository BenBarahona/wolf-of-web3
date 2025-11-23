// Circle SDK Types

export interface CircleConfig {
  appId: string;
}

export interface UserSession {
  userId: string;
  userToken: string;
  encryptionKey: string;
  challengeId?: string; // Optional: only needed for signup/PIN setup, not for login
  refreshToken?: string;
}

export interface WalletInfo {
  walletId: string;
  address: string;
  blockchain: string;
  state: string;
}

export interface ChallengeResult {
  type: string;
  status: string;
  data?: {
    signature?: string;
    transactionHash?: string;
    [key: string]: any;
  };
}

export type ChallengeType = 'SET_PIN' | 'RESTORE_PIN' | 'SIGN_TRANSACTION';

export interface UserStatus {
  id: string;
  status: string;
  pinStatus: string;
  securityQuestionStatus: string;
  createDate: string;
  updateDate: string;
}

export interface Balance {
  token: {
    id: string;
    blockchain: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  amount: string;
  updateDate: string;
}

