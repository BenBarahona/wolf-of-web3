# Arc Integration - Circle's Layer-1 Blockchain

## What is Arc?

[Arc](https://docs.arc.network/arc/concepts/welcome-to-arc) is Circle's purpose-built Layer-1 blockchain designed to unite programmable money with real-world economic activity.

### Key Features

- **USDC as Native Gas** - Pay transaction fees in USDC, not native tokens
- **Sub-second Finality** - Deterministic and fast transaction confirmation
- **EVM Compatible** - Use familiar Ethereum tooling and smart contracts
- **Enterprise-grade** - Built for compliance and institutional adoption
- **Full Circle Integration** - Native support for CCTP, Circle APIs, and more

### Network Details (Testnet)

| Property         | Value                           |
| ---------------- | ------------------------------- |
| **Network**      | Arc Testnet                     |
| **RPC Endpoint** | https://rpc.testnet.arc.network |
| **Chain ID**     | 5042002                         |
| **Currency**     | USDC                            |
| **Explorer**     | https://testnet.arcscan.app     |
| **Faucet**       | https://faucet.circle.com       |

## Why Arc for Wolf of Web3?

Arc is the perfect blockchain for Wolf of Web3 because:

1. **USDC Native** - Your investment platform deals in USDC, and Arc uses USDC for gas
2. **Circle Ecosystem** - Seamless integration with Circle Wallets, CCTP, and other Circle services
3. **Fast & Predictable** - Sub-second finality means quick trade execution
4. **Low Fees** - Predictable fiat-based fees in USDC
5. **DeFi Ready** - Purpose-built for financial applications

## Getting Testnet USDC

1. Create your wallet using the Wolf of Web3 app
2. Copy your wallet address
3. Visit [Circle's Arc Faucet](https://faucet.circle.com)
4. Paste your address and request testnet USDC
5. USDC will arrive instantly (used for both transactions AND gas!)

## Arc in Your Code

### Default Configuration

Wolf of Web3 is configured to use Arc Testnet by default:

```typescript
// Backend - CircleService
async createWallet(
  userToken: string,
  blockchain: string = 'ARC-TESTNET',  // ✅ Arc Testnet
  accountType: 'SCA' | 'EOA' = 'SCA',
)

// Frontend - useCreateWallet hook
const wallet = await createWallet('ARC-TESTNET', 'SCA');
```

### Switching to Arc Mainnet

When Arc Mainnet is available, simply change the blockchain parameter:

```typescript
const wallet = await createWallet("ARC", "SCA");
```

## Adding Arc to MetaMask

To interact with Arc contracts directly (optional):

1. Open MetaMask → **Add network** → **Add a network manually**
2. Fill in:
   - **Network name**: Arc Testnet
   - **New RPC URL**: https://rpc.testnet.arc.network
   - **Chain ID**: 5042002
   - **Currency symbol**: USDC
   - **Explorer URL**: https://testnet.arcscan.app
3. Save and switch to Arc

## Arc + Circle Smart Wallets

When you create a Smart Contract Account (SCA) on Arc through Wolf of Web3:

- ✅ **Gas abstraction** - Users don't need to manage gas
- ✅ **USDC fees** - All fees in USDC (no confusing token conversions)
- ✅ **Batched transactions** - Execute multiple trades atomically
- ✅ **Social recovery** - Recover wallet without seed phrases
- ✅ **Sponsored transactions** - App can pay gas for users

## Arc for DeFi (Your Use Case)

Arc is designed for exactly what Wolf of Web3 does:

### Onchain Credit & Lending

Build credit infrastructure with stablecoins:

- Identity-based lending protocols
- Reputation-driven credit systems
- SMB and consumer credit apps

### Capital Markets

Stablecoin-native settlement:

- Tokenized securities with instant DvP
- Collateral management systems
- Tokenized funds and structured products

### Stablecoin FX

Markets around stablecoin conversion:

- Perpetuals and derivatives on stablecoin pairs
- Swap APIs for programmatic conversion
- Treasury tools for multi-currency rebalancing

### AI-Powered Trading

Your exact use case:

- AI agents can execute trades autonomously
- Sub-second finality for fast rebalancing
- Low fees mean more frequent optimization
- USDC native means no token conversions

## Architecture: Circle Smart Wallet + Arc

```
┌─────────────────────────────────────────────┐
│         Wolf of Web3 Frontend               │
│  User interacts with beautiful UI           │
└─────────────────┬───────────────────────────┘
                  │
                  │ Circle Web SDK
                  ▼
┌─────────────────────────────────────────────┐
│      Circle Smart Contract Account          │
│      (Deployed on Arc Testnet)              │
│                                             │
│  - User authenticates with PIN              │
│  - Wallet address: 0x...                    │
│  - Holds USDC for trading                   │
│  - USDC used for gas fees                   │
└─────────────────┬───────────────────────────┘
                  │
                  │ Executes transactions
                  ▼
┌─────────────────────────────────────────────┐
│              Arc Blockchain                 │
│         (Chain ID: 5042002)                 │
│                                             │
│  - DeFi protocols (Uniswap, Aave, etc.)     │
│  - AI agent contracts (x402)                │
│  - Stablecoin swap protocols                │
│  - All fees paid in USDC                    │
└─────────────────────────────────────────────┘
```

## Next Steps

1. ✅ **Wallets created on Arc** - Your integration is ready!
2. 🔜 **Deploy trading contracts** - Deploy your DeFi strategies on Arc
3. 🔜 **Add CCTP** - Enable cross-chain USDC transfers to Arc
4. 🔜 **Integrate DEXs** - Connect to Arc-native DEXs for trading
5. 🔜 **x402 Agents** - Deploy AI agents that execute trades on Arc

## Resources

- [Arc Documentation](https://docs.arc.network/arc/concepts/welcome-to-arc)
- [Connect to Arc](https://docs.arc.network/arc/references/connect-to-arc)
- [Arc Explorer (Testnet)](https://testnet.arcscan.app)
- [Arc Faucet](https://faucet.circle.com)
- [Circle Developer Docs](https://developers.circle.com/)

## Troubleshooting

### Blockchain identifier not recognized

If you get an error about `ARC-TESTNET` not being recognized, the identifier might be different. Check your Circle Developer Console or try:

- `ARC-TEST`
- `ARC_TESTNET`
- `ARCTEST`

Update the defaults in:

- `backend/src/services/circle/circle/circle.service.ts`
- `frontend/lib/circle/hooks.ts`
- `frontend/lib/circle/api.ts`

### Need mainnet?

Arc Mainnet identifier (when available) will likely be:

- `ARC` or `ARC-MAINNET`

---

**Arc + Circle Smart Wallets = The perfect foundation for AI-powered DeFi** 🚀
