# Circle User-Controlled Wallets Integration Guide

This guide explains how Circle's User-Controlled Wallets are integrated into the Wolf of Web3 project.

## Overview

Wolf of Web3 uses Circle's Programmable Wallets SDK to provide users with:

- **Smart Contract Accounts (SCA)** - Gas abstraction and advanced features
- **PIN-based authentication** - No seed phrases required
- **Non-custodial wallets** - Users maintain full control
- **Seamless onboarding** - Simple wallet creation flow

## Architecture

### Backend (NestJS)

**Location**: `/backend/src/`

#### Circle Service

`services/circle/circle/circle.service.ts`

Handles all Circle API interactions:

- User creation and management
- Session token generation
- Challenge creation (for PIN setup, transactions)
- Wallet creation (SCA and EOA)
- Transaction initialization
- Wallet balance queries

#### Wallet Controller

`app/api/wallet/wallet.controller.ts`

REST API endpoints:

- `GET /api/wallet/config` - Get Circle App ID
- `POST /api/wallet/user/create` - Create new user
- `POST /api/wallet/user/token` - Acquire session token
- `POST /api/wallet/challenge` - Create challenge
- `POST /api/wallet/wallet/create` - Create wallet
- `GET /api/wallet/user/status` - Get user status
- `GET /api/wallet/wallets` - List user wallets
- `POST /api/wallet/wallet/balance` - Get wallet balance
- `POST /api/wallet/user/pin/restore` - Restore PIN
- `POST /api/wallet/transaction/create` - Create transaction

### Frontend (Next.js)

**Location**: `/frontend/`

#### Circle SDK Provider

`lib/circle/CircleProvider.tsx`

React Context provider that:

- Initializes Circle Web SDK
- Manages user sessions
- Handles authentication
- Executes challenges (PIN setup, transactions)
- Persists session to localStorage

#### Custom Hooks

`lib/circle/hooks.ts`

React hooks for wallet operations:

- `useCreateUser()` - Create new user
- `useSetupPIN()` - Setup user PIN
- `useCreateWallet()` - Create wallet
- `useUserStatus()` - Get user status
- `useWallets()` - List wallets
- `useWalletBalance()` - Get balance
- `useRestorePin()` - Restore PIN
- `useTransaction()` - Send transactions

#### UI Components

`components/WalletSetup.tsx`

Beautiful wallet creation flow with:

- User onboarding
- PIN setup modal
- Wallet creation
- Success screen with wallet details

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies

```bash
cd backend
yarn install
```

#### Environment Variables

Create a `.env` file in `/backend/`:

```env
# Circle API Configuration
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_APP_ID=your_circle_app_id_here
CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here

# Optional: For smart contract operations
CIRCLE_PRIVATE_KEY=your_private_key_here
RPC_URL=https://eth.llamarpc.com

# Server
PORT=4000
```

#### Get Circle Credentials

1. Sign up at [Circle Developer Console](https://console.circle.com/)
2. Create a new User-Controlled Wallets project
3. Navigate to the [Configurator](https://console.circle.com/wallets/user/configurator)
4. Copy your **App ID**, **API Key**, and **Entity Secret**

#### Start Backend

```bash
yarn dev
```

The backend will run on `http://localhost:4000`

### 2. Frontend Setup

#### Install Dependencies

```bash
cd frontend
yarn install
```

#### Environment Variables

Create a `.env.local` file in `/frontend/`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Start Frontend

```bash
yarn dev
```

The frontend will run on `http://localhost:3000`

## Usage Flow

### 1. User Creation

```typescript
import { useCreateUser } from "@/lib/circle";

const { createUser, loading, error } = useCreateUser();

// Create a new user
const userData = await createUser();
// Returns: { userId, userToken, encryptionKey, challengeId }
```

### 2. PIN Setup

The Circle SDK automatically shows a modal for PIN entry:

```typescript
import { useSetupPIN } from "@/lib/circle";

const { setupPIN, loading, error } = useSetupPIN();

// Trigger PIN setup modal
const success = await setupPIN();
```

### 3. Wallet Creation

```typescript
import { useCreateWallet } from "@/lib/circle";

const { createWallet, loading, error } = useCreateWallet();

// Create a Smart Contract Account on Polygon Amoy
const wallet = await createWallet("ARC-TESTNET", "SCA");
// Returns: { walletId, address, blockchain, state }
```

### 4. List Wallets

```typescript
import { useWallets } from "@/lib/circle";

const { getWallets, loading, error } = useWallets();

const wallets = await getWallets();
```

### 5. Get Balance

```typescript
import { useWalletBalance } from "@/lib/circle";

const { getBalance, loading, error } = useWalletBalance();

const balances = await getBalance(walletId);
```

### 6. Send Transaction

```typescript
import { useTransaction } from "@/lib/circle";

const { sendTransaction, loading, error } = useTransaction();

const success = await sendTransaction(
  walletId,
  destinationAddress,
  amount,
  tokenId // optional
);
```

## Supported Blockchains

Circle supports multiple blockchains for wallet creation:

- **Polygon** (Amoy testnet, Mainnet)
- **Ethereum** (Sepolia testnet, Mainnet)
- **Arbitrum** (Sepolia testnet, Mainnet)
- **Avalanche** (Fuji testnet, Mainnet)
- **Solana** (Devnet, Mainnet)
- And more...

For this project, we use:

- **ARC-TESTNET** (Arc Testnet) for development
- **ARC** (Arc Mainnet) for production (when available)

Arc is Circle's purpose-built Layer-1 blockchain with USDC as native gas, making it perfect for DeFi applications.

## Account Types

### Smart Contract Account (SCA) - Recommended

- Gas abstraction (sponsored transactions)
- Batch transactions
- Social recovery
- Advanced security features
- Better UX for end users

### Externally Owned Account (EOA)

- Traditional wallet type
- Direct blockchain interaction
- Requires gas for all transactions

**Wolf of Web3 uses SCA by default** for the best user experience.

## Security Features

1. **PIN Protection** - Users create a 6-digit PIN
2. **Encryption** - All sensitive data is encrypted
3. **MPC Technology** - Multi-party computation for key management
4. **Security Questions** - Additional recovery method (optional)
5. **Session Management** - Secure token-based authentication

## API Integration Examples

### Create User (Backend)

```typescript
// POST /api/wallet/user/create
const response = await fetch("http://localhost:4000/api/wallet/user/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: "optional-user-id" }),
});
```

### Create Wallet (Backend)

```typescript
// POST /api/wallet/wallet/create
const response = await fetch("http://localhost:4000/api/wallet/wallet/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-User-Token": userToken,
  },
  body: JSON.stringify({
    blockchain: "ARC-TESTNET",
    accountType: "SCA",
  }),
});
```

## Testing

### Using the Sample App

1. Start both backend and frontend
2. Navigate to `http://localhost:3000`
3. Click "Create Smart Wallet"
4. Follow the onboarding flow:
   - User creation
   - PIN setup (Circle modal)
   - Wallet creation
   - Success screen

### Manual API Testing

Use the provided cURL commands or API client (Postman, Insomnia):

```bash
# Get config
curl http://localhost:3001/api/wallet/config

# Create user
curl -X POST http://localhost:3001/api/wallet/user/create \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Troubleshooting

### SDK Not Initializing

- Check that `CIRCLE_APP_ID` is set correctly
- Verify backend is running and accessible
- Check browser console for errors

### PIN Setup Modal Not Appearing

- Ensure Circle SDK is initialized (`isInitialized: true`)
- Verify user session is set correctly
- Check that challenge ID is valid

### Wallet Creation Fails

- Verify user has completed PIN setup
- Check that PIN status is "ENABLED"
- Ensure API key has correct permissions

### CORS Issues

- Backend should allow frontend origin
- Check that `NEXT_PUBLIC_API_URL` is correct

## References

- [Circle Developer Documentation](https://developers.circle.com/wallets/user-controlled)
- [Circle Web SDK](https://github.com/circlefin/w3s-pw-web-sdk)
- [Circle Developer Console](https://console.circle.com)
- [API Reference](https://developers.circle.com/api-reference/wallets/developer-controlled-wallets)

## Next Steps

Now that Circle wallet integration is complete, you can:

1. **Add CCTP Integration** - Enable cross-chain USDC transfers
2. **Implement AI Strategies** - Use x402 agents for investment strategies
3. **Add DeFi Protocols** - Integrate Uniswap, Aave, etc.
4. **Create Dashboard** - Build portfolio tracking UI
5. **Add World ID** - Integrate World ID verification
6. **Deploy to Celo** - Create MiniApp for MiniPay

## Support

For issues or questions:

- Check Circle's [Developer Forum](https://community.circle.com/)
- Review [API Documentation](https://developers.circle.com/)
- Contact Circle Support through the developer console
