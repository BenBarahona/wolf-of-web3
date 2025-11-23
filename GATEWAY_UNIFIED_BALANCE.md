# Circle Gateway Unified Balance Integration

## Overview

This implementation adds **Circle Gateway's Unified Balance** feature to the Wolf of Web3 platform, allowing users to view their USDC holdings across multiple chains in one unified interface.

Based on: [Circle Gateway Unified Balance Quickstart](https://developers.circle.com/gateway/quickstarts/unified-balance)

## What is Circle Gateway?

Circle Gateway provides chain abstraction for USDC, allowing users to:

- **View unified balances** across multiple chains in a single interface
- **Transfer USDC** between chains using burn intents and attestations
- **Manage crosschain USDC** without worrying about individual chain details

## Implementation

### Supported Chains

The implementation supports three chains:

- **Arc Testnet** (Domain 26) ⚡
- **World Chain Sepolia** (Domain 14) 🌍
- **Base Sepolia** (Domain 6) 🔵

### Architecture

```
Frontend (React/Next.js)
    ↓
Backend API (NestJS)
    ↓
Circle Gateway API
```

## Files Created/Modified

### Backend

#### 1. **Gateway Service** (`backend/src/services/bridge/gateway.service.ts`)

- Main service for interacting with Circle Gateway API
- Provides methods for:
  - Fetching unified balances across chains
  - Getting balance summaries for specific addresses
  - Supporting future transfer operations

**Key Methods:**

- `getUnifiedBalance(depositor, domains?)` - Get balances across specified domains
- `getWolfChainBalances(depositor)` - Get balances for Arc, World, and Base
- `getBalanceSummary(depositor)` - Get formatted summary with totals
- `getInfo()` - Fetch Gateway API information about supported chains

#### 2. **Bridge Controller** (`backend/src/app/api/bridge/bridge.controller.ts`)

Added Gateway endpoints:

- `GET /api/bridge/gateway/info` - Gateway information
- `GET /api/bridge/gateway/balance?address={address}` - Get unified balance
- `GET /api/bridge/gateway/domains` - Get supported domains

#### 3. **Bridge Module** (`backend/src/services/bridge/bridge.module.ts`)

- Added `GatewayService` to module providers and exports

### Frontend

#### 1. **Gateway API Client** (`frontend/lib/bridge/gateway-api.ts`)

Frontend API client for communicating with backend Gateway endpoints.

**Key Functions:**

- `getUnifiedBalance(address)` - Fetch unified balance for an address
- `getGatewayInfo()` - Get Gateway API information
- `getSupportedDomains()` - Get supported chain domains
- `formatUSDC(amount)` - Format USDC amounts for display
- `getChainColor(chainName)` - Get gradient colors for chain badges
- `getChainIcon(chainName)` - Get emoji icons for chains

#### 2. **Unified Balance View Component** (`frontend/components/UnifiedBalanceView.tsx`)

Main component displaying unified USDC balances.

**Features:**

- Total USDC balance across all chains
- Per-chain balance breakdown with beautiful gradient cards
- Active chain indicators
- Percentage distribution
- Quick action buttons
- Informational cards about the feature

#### 3. **Transfer Modal Component** (`frontend/components/UnifiedTransferModal.tsx`)

Modal for transferring USDC between chains.

**Features:**

- Source and destination chain selection
- Amount input with max button
- Fee estimation display
- Multi-step UI (form → signing → processing → success/error)
- Coming soon notice (full implementation requires wallet signature integration)

#### 4. **Holdings Page** (`frontend/app/holdings/page.tsx`)

Updated to display the unified balance view.

**Features:**

- Loads user's wallet address from localStorage
- Displays `UnifiedBalanceView` component
- Beautiful gradient background
- Informational sections explaining how Gateway works

## API Endpoints

### Gateway Endpoints

#### Get Balance Summary

```http
GET /api/bridge/gateway/balance?address={walletAddress}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUSDC": 150.5,
    "chains": [
      {
        "chainName": "Arc Testnet",
        "domain": 26,
        "balance": "50.50",
        "balanceFormatted": 50.5
      },
      {
        "chainName": "World Chain Sepolia",
        "domain": 14,
        "balance": "75.00",
        "balanceFormatted": 75.0
      },
      {
        "chainName": "Base Sepolia",
        "domain": 6,
        "balance": "25.00",
        "balanceFormatted": 25.0
      }
    ]
  }
}
```

#### Get Gateway Info

```http
GET /api/bridge/gateway/info
```

Returns information about all supported chains and contracts from Circle Gateway.

#### Get Supported Domains

```http
GET /api/bridge/gateway/domains
```

Returns the three chains we support (Arc, World, Base).

## How It Works

### 1. Unified Balance View

When a user visits the Holdings page:

1. The page fetches the user's wallet address from localStorage
2. Passes the address to `UnifiedBalanceView` component
3. Component calls `getUnifiedBalance(address)` API
4. Backend queries Circle Gateway API for balances across all three chains
5. Returns aggregated data showing:
   - Total USDC across all chains
   - Individual chain balances
   - Percentage distribution
   - Active chains

### 2. Gateway API Flow

```
User Wallet Address
        ↓
Frontend API Call
        ↓
Backend Gateway Service
        ↓
Circle Gateway API
        ↓
POST /v1/balances
{
  "token": "USDC",
  "sources": [
    { "depositor": "0x...", "domain": 26 },  // Arc
    { "depositor": "0x...", "domain": 14 },  // World
    { "depositor": "0x...", "domain": 6 }    // Base
  ]
}
        ↓
Response with balances
        ↓
Backend formats and aggregates
        ↓
Frontend displays in UI
```

## Circle Gateway Domains

| Chain               | Domain | Symbol |
| ------------------- | ------ | ------ |
| Arc Testnet         | 26     | ⚡     |
| World Chain Sepolia | 14     | 🌍     |
| Base Sepolia        | 6      | 🔵     |
| Ethereum Sepolia    | 0      | 🔷     |
| Avalanche Fuji      | 1      | 🔺     |
| OP Sepolia          | 2      | 🔴     |
| Arbitrum Sepolia    | 3      | 🔵     |
| Polygon Amoy        | 7      | 🟣     |

_Currently, Wolf of Web3 focuses on Arc, World, and Base._

## Future Enhancements

### Transfer Functionality (Planned)

The `UnifiedTransferModal` component is implemented with a placeholder. Full implementation requires:

1. **EIP-712 Typed Data Signing**
   - Create burn intent with typed data structure
   - Sign using user's wallet (MetaMask/Circle Wallet)
2. **Burn Intent Structure**

   ```typescript
   {
     maxBlockHeight: "max uint256",
     maxFee: "2010000", // 2.01 USDC
     spec: {
       version: 1,
       sourceDomain: 26,
       destinationDomain: 14,
       sourceContract: "0x...", // Gateway Wallet
       destinationContract: "0x...", // Gateway Minter
       sourceToken: "0x...", // USDC on source
       destinationToken: "0x...", // USDC on dest
       sourceDepositor: "0x...",
       destinationRecipient: "0x...",
       sourceSigner: "0x...",
       destinationCaller: "0x0000...",
       value: "amount in smallest unit",
       salt: "random bytes32",
       hookData: "0x"
     }
   }
   ```

3. **Backend Transfer Endpoint**
   - Receive signed burn intent
   - Submit to Gateway API `/v1/transfer`
   - Receive attestation
   - Return attestation to frontend

4. **Minting on Destination**
   - Call `gatewayMint(attestation, signature)` on destination chain
   - Wait for confirmation
   - Update balances

## Design Features

### UI/UX Highlights

1. **Gradient Cards** - Each chain has a unique gradient color scheme
2. **Real-time Balance Updates** - Balances update when wallet changes
3. **Responsive Design** - Works on mobile and desktop
4. **Loading States** - Smooth loading animations
5. **Error Handling** - Clear error messages
6. **Empty States** - Informative prompts when no wallet connected
7. **Active Indicators** - Visual indicators for chains with balance
8. **Percentage Distribution** - Shows how USDC is distributed across chains

### Color Scheme

```typescript
Arc Testnet:       from-blue-500 to-purple-500
World Chain:       from-green-500 to-teal-500
Base Sepolia:      from-blue-600 to-indigo-600
```

## Testing

### Test the Integration

1. **Start Backend:**

   ```bash
   cd backend
   yarn start:dev
   ```

2. **Start Frontend:**

   ```bash
   cd frontend
   yarn dev
   ```

3. **Navigate to Holdings:**
   - Go to `/holdings` page
   - Ensure you're logged in with Circle wallet
   - View your unified USDC balance

### Example Test Flow

1. User logs in and creates Circle wallet
2. User deposits USDC on Arc Testnet via faucet
3. User navigates to Holdings page
4. Unified balance shows USDC on Arc with 0 on World and Base
5. User can see total balance and distribution

## Environment Variables

No additional environment variables needed. The Gateway API is public (testnet).

## Dependencies

### Backend

- `@nestjs/common`
- `@nestjs/config`
- `axios` (for HTTP requests to Gateway API)

### Frontend

- `react`
- `next`
- All existing dependencies

## API Rate Limits

Circle Gateway API (testnet) has generous rate limits for testing. No authentication required for balance queries.

## Security Notes

- Gateway API calls are proxied through backend to avoid CORS issues
- No sensitive keys required for balance queries
- Transfer operations will require user wallet signatures (not implemented yet)

## Resources

- [Circle Gateway Docs](https://developers.circle.com/gateway/quickstarts/unified-balance)
- [CCTP Supported Blockchains](https://developers.circle.com/cctp/cctp-supported-blockchains)
- [Gateway Contract Interfaces](https://developers.circle.com/gateway/references/contract-interfaces-and-events)

## Conclusion

This implementation provides a beautiful, user-friendly interface for viewing unified USDC balances across multiple chains. Users can see their total USDC holdings at a glance, with detailed breakdowns per chain, all powered by Circle Gateway's chain abstraction technology.

The foundation is laid for future transfer functionality, which will enable seamless cross-chain USDC movements with minimal friction.
