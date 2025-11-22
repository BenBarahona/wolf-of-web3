# Circle Integration Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                        │   │
│  │                    (localhost:3000)                        │   │
│  │                                                            │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │         WalletSetup.tsx Component                │    │   │
│  │  │  - Onboarding UI                                │    │   │
│  │  │  - User creation flow                            │    │   │
│  │  │  - Wallet display                                │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                        │                                  │   │
│  │                        │ uses                             │   │
│  │                        ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │         CircleProvider Context                   │    │   │
│  │  │  - SDK initialization                            │    │   │
│  │  │  - Session management                            │    │   │
│  │  │  - Challenge execution                           │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                        │                                  │   │
│  │                        │ uses                             │   │
│  │                        ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │           Circle Hooks (hooks.ts)                │    │   │
│  │  │  - useCreateUser()                               │    │   │
│  │  │  - useSetupPIN()                                 │    │   │
│  │  │  - useCreateWallet()                             │    │   │
│  │  │  - useWallets()                                  │    │   │
│  │  │  - useWalletBalance()                            │    │   │
│  │  │  - useTransaction()                              │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                        │                                  │   │
│  │                        │ calls                            │   │
│  │                        ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │         API Client (api.ts)                      │    │   │
│  │  │  - HTTP requests to backend                      │    │   │
│  │  │  - Error handling                                │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                        │                                  │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │      Circle Web SDK (@circle-fin/w3s-pw-web-sdk) │    │   │
│  │  │  - PIN entry modal                               │    │   │
│  │  │  - Challenge execution                           │    │   │
│  │  │  - Biometric support                             │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ HTTP/REST
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                   NestJS Backend                                  │
│                   (localhost:3001)                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         WalletController                                │   │
│  │         /api/wallet/*                                   │   │
│  │                                                         │   │
│  │  Routes:                                                │   │
│  │  GET  /api/wallet/config                               │   │
│  │  POST /api/wallet/user/create                          │   │
│  │  POST /api/wallet/user/token                           │   │
│  │  POST /api/wallet/challenge                            │   │
│  │  POST /api/wallet/wallet/create                        │   │
│  │  GET  /api/wallet/user/status                          │   │
│  │  GET  /api/wallet/wallets                              │   │
│  │  POST /api/wallet/wallet/balance                       │   │
│  │  POST /api/wallet/user/pin/restore                     │   │
│  │  POST /api/wallet/transaction/create                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           │ uses                                 │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         CircleService                                   │   │
│  │                                                         │   │
│  │  Methods:                                               │   │
│  │  - createUser()                                         │   │
│  │  - acquireSessionToken()                                │   │
│  │  - createChallenge()                                    │   │
│  │  - createWallet()                                       │   │
│  │  - getUserStatus()                                      │   │
│  │  - listWallets()                                        │   │
│  │  - getWalletBalance()                                   │   │
│  │  - restorePin()                                         │   │
│  │  - createTransaction()                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           │ uses                                 │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   Circle Developer SDK                                  │   │
│  │   (@circle-fin/developer-controlled-wallets)            │   │
│  │   - HTTP client for Circle API                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ HTTPS/REST
                           │ (with API Key auth)
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                     Circle Platform                               │
│                     (api.circle.com)                              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Circle W3S API                                  │   │
│  │         /v1/w3s/*                                       │   │
│  │                                                         │   │
│  │  - User management                                      │   │
│  │  - Wallet creation                                      │   │
│  │  - Transaction processing                               │   │
│  │  - Balance queries                                      │   │
│  │  - Challenge management                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         MPC Key Management System                       │   │
│  │  - Distributed key generation                           │   │
│  │  - Secure key storage                                   │   │
│  │  - Transaction signing                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ Blockchain RPC
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    Blockchain Networks                            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Polygon    │  │   Ethereum   │  │   Arbitrum   │  ...    │
│  │   (Amoy)     │  │   (Sepolia)  │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  - Smart Contract Account (SCA) deployment                        │
│  - Transaction execution                                          │
│  - Balance queries                                                │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow: Wallet Creation

### Step 1: User Initiates Wallet Creation

```
User clicks "Create Smart Wallet"
  ↓
WalletSetup.tsx → useCreateUser()
  ↓
hooks.ts → api.ts → POST /api/wallet/user/create
  ↓
WalletController → CircleService.createUser()
  ↓
Circle API → POST /v1/w3s/users
  ↓
Response: { userId, userToken, encryptionKey, challengeId }
```

### Step 2: PIN Setup

```
User clicks "Set PIN"
  ↓
useSetupPIN() → executeChallenge(challengeId)
  ↓
Circle Web SDK opens PIN modal
  ↓
User enters 6-digit PIN
  ↓
SDK encrypts PIN and sends to Circle
  ↓
Circle validates and stores encrypted PIN
  ↓
Response: { status: "COMPLETED" }
```

### Step 3: Wallet Creation

```
Automatic after PIN setup
  ↓
useCreateWallet('MATIC-AMOY', 'SCA')
  ↓
api.ts → POST /api/wallet/wallet/create
  ↓
WalletController → CircleService.createWallet()
  ↓
Circle API → POST /v1/w3s/user/wallets
  ↓
Circle deploys Smart Contract Account on Polygon
  ↓
Response: { walletId, address, blockchain, state }
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User Session Created                                │
│     - userId                                            │
│     - userToken (JWT)                                   │
│     - encryptionKey                                     │
│     - challengeId                                       │
│                                                         │
│  2. Stored in:                                          │
│     - React Context (CircleProvider)                    │
│     - localStorage (persistence)                        │
│                                                         │
│  3. Circle SDK Authenticated:                           │
│     sdk.setAuthentication({                             │
│       userToken,                                        │
│       encryptionKey                                     │
│     })                                                  │
│                                                         │
│  4. All API Requests Include:                           │
│     Header: X-User-Token: <userToken>                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Receives Request with X-User-Token header           │
│                                                         │
│  2. Forwards to Circle API with:                        │
│     - Authorization: Bearer <CIRCLE_API_KEY>            │
│     - X-User-Token: <userToken>                         │
│                                                         │
│  3. Circle validates token and authorizes request       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  User's Device                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────┐         │
│  │  Circle Web SDK (Browser)                │         │
│  │  - Handles PIN entry                     │         │
│  │  - Client-side encryption                │         │
│  │  - Secure key derivation                 │         │
│  └──────────────────────────────────────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Encrypted communication
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Circle Platform                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────┐         │
│  │  MPC Key Management                      │         │
│  │  - Key shares distributed                │         │
│  │  - No single point of failure            │         │
│  │  - Threshold signature scheme            │         │
│  └──────────────────────────────────────────┘         │
│                                                         │
│  User's private key is:                                 │
│  - Never stored in one place                            │
│  - Never accessible to Circle                           │
│  - Never sent over network                              │
│  - Protected by user's PIN                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Transaction Signing Flow

```
1. User initiates transaction
   ↓
2. Backend creates transaction via Circle API
   ↓
3. Circle returns challengeId
   ↓
4. Frontend executes challenge
   ↓
5. Circle SDK prompts user for PIN
   ↓
6. User enters PIN
   ↓
7. SDK derives key locally using PIN
   ↓
8. MPC signing ceremony begins
   - User's device holds key share
   - Circle holds key shares
   - Threshold signatures created
   ↓
9. Transaction signed without exposing full private key
   ↓
10. Signed transaction broadcast to blockchain
    ↓
11. Transaction confirmed on-chain
```

## File Structure

```
wolf-of-web3/
├── backend/
│   └── src/
│       ├── services/circle/
│       │   ├── circle/
│       │   │   └── circle.service.ts      ← Circle API integration
│       │   ├── circle.module.ts           ← NestJS module
│       │   └── circle.client.ts           ← Viem wallet client
│       └── app/api/wallet/
│           ├── wallet.controller.ts       ← REST endpoints
│           └── wallet.module.ts           ← Controller module
│
└── frontend/
    ├── lib/circle/
    │   ├── CircleProvider.tsx             ← React Context
    │   ├── hooks.ts                       ← Custom hooks
    │   ├── api.ts                         ← API client
    │   ├── types.ts                       ← TypeScript types
    │   └── index.ts                       ← Exports
    ├── components/
    │   └── WalletSetup.tsx                ← UI component
    └── app/
        ├── layout.tsx                     ← Wrapped with CircleProvider
        └── page.tsx                       ← Uses WalletSetup
```

## Key Concepts

### Smart Contract Account (SCA)

- Wallet is a smart contract on-chain
- Enables gas abstraction
- Supports batched transactions
- More flexible than EOA

### Challenges

- Used for sensitive operations
- PIN setup
- Transaction signing
- PIN recovery

### User Tokens

- JWT tokens for session management
- Tied to specific user
- Used for API authentication
- Short-lived for security

### Encryption Keys

- Client-side encryption
- Derived from user's PIN
- Never sent to server
- Used by Circle Web SDK

## Integration Points

### With AI Agents (x402)

```
User approves strategy
  ↓
AI agent creates transaction
  ↓
Circle signs with user's PIN
  ↓
Transaction executed on-chain
```

### With CCTP

```
User deposits USDC (any chain)
  ↓
CCTP bridges to target chain
  ↓
Deposited to Circle wallet
  ↓
Available for AI strategies
```

### With DeFi Protocols

```
AI strategy generated
  ↓
Multiple transactions created
  ↓
Batched in single SCA call
  ↓
User approves once with PIN
  ↓
All trades executed atomically
```

---

This architecture provides a secure, user-friendly, and scalable foundation for Wolf of Web3's AI-powered investment platform.
