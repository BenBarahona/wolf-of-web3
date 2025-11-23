# Circle Bridge Kit Integration

This document describes the integration of Circle's Bridge Kit for cross-chain USDC transfers in the Wolf of Web3 platform.

## Overview

The bridge integration allows users to transfer USDC between three supported chains:

- **Arc L2 Testnet** - Low Risk Lending Vault
- **Celo Alfajores** - Medium Risk Staking Vault
- **World Chain** - High Risk Meme Index Vault

Users can seamlessly move capital between chains to access different risk profiles and investment strategies.

## Architecture

### Components

```
frontend/
├── lib/bridge/
│   ├── chains.config.ts       # Chain configurations and constants
│   ├── bridge.service.ts      # Core bridge logic using Bridge Kit
│   ├── hooks.ts               # React hooks for bridge operations
│   └── index.ts               # Public exports
├── components/
│   └── BridgeInterface.tsx    # UI component for bridging
└── app/bridge/
    └── page.tsx               # Bridge page
```

### Technology Stack

- **@circle-fin/bridge-kit**: Core bridging library
- **@circle-fin/adapter-viem-v2**: Viem adapter for EVM chains
- **Circle CCTP**: Cross-Chain Transfer Protocol (native USDC bridging)
- **Wagmi + Viem**: Blockchain interaction layer

## Chain Configuration

### Supported Chains

| Chain          | Chain ID | USDC Address                                 | Vault Address                                | Risk Level |
| -------------- | -------- | -------------------------------------------- | -------------------------------------------- | ---------- |
| Arc L2 Testnet | 5042002  | `0x3600000000000000000000000000000000000000` | From env var                                 | Low        |
| Celo Alfajores | 44787    | `0x01C5C0122039549AD1493B8220cABEdD739BC44E` | `0x56C4c8dbb6E9598b90119686c40271a969e1eE44` | Medium     |
| World Chain    | 4801     | `0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88` | `0x56C4c8dbb6E9598b90119686c40271a969e1eE44` | High       |

### Vault Contracts

Each chain hosts a different vault strategy:

1. **Arc - WolfBaseLendingVault** (Low Risk)
   - Conservative lending strategies
   - Lowest risk, stable returns
   - Symbol: wLEND-ARC

2. **Celo - WolfBaseStakingVault** (Medium Risk)
   - Staking strategies on Celo
   - Moderate risk and returns
   - Symbol: wSTAKE-CELO

3. **World - WolfBaseIndexVault** (High Risk)
   - High-risk meme coin index
   - Highest risk and potential returns
   - Symbol: wMEME-WORLD

## How It Works

### CCTP Bridge Flow

1. **User Initiates Transfer**
   - Selects source and destination chains
   - Specifies amount of USDC to bridge
   - Optionally sets recipient address (defaults to sender)

2. **Token Burn**
   - USDC is burned on source chain
   - Transaction hash generated
   - Attestation process begins

3. **Attestation**
   - Circle's attestation service validates the burn
   - Generates attestation signature
   - Typically takes 2-5 minutes

4. **Token Mint**
   - USDC is minted on destination chain
   - Same amount as burned (minus minimal fees)
   - User receives native USDC (not wrapped)

### Transfer Timeline

- **Source Chain Confirmation**: 5-10 minutes
- **Circle Attestation**: 2-5 minutes
- **Destination Chain Minting**: 5-10 minutes
- **Total Estimated Time**: 15-25 minutes

## Usage

### React Hooks

#### `useBridgeTransfer()`

Main hook for initiating bridge transfers:

```typescript
import { useBridgeTransfer } from '@/lib/bridge';

function BridgeComponent() {
  const { transfer, status, isLoading, error, reset } = useBridgeTransfer();

  const handleBridge = async () => {
    await transfer({
      sourceChainId: 5042002,      // Arc
      destinationChainId: 44787,    // Celo
      amount: '100',                // 100 USDC
      recipientAddress: '0x...',    // Optional
    });
  };

  return (
    <div>
      <button onClick={handleBridge} disabled={isLoading}>
        Bridge
      </button>
      {status && <p>Status: {status.message}</p>}
    </div>
  );
}
```

#### `useBridgeEstimates()`

Get transfer estimates:

```typescript
const { estimatedTime, estimatedFee } = useBridgeEstimates(
  sourceChainId,
  destinationChainId,
  amount
);
```

#### `useBridgeStatus()`

Monitor a specific transfer:

```typescript
const { status, isLoading, checkStatus } = useBridgeStatus(
  attestationHash,
  destinationChainId
);
```

### Service Functions

Direct access to bridge services:

```typescript
import {
  initiateBridgeTransfer,
  checkBridgeStatus,
  getSupportedRoutes,
} from "@/lib/bridge";

// Get all supported routes
const routes = getSupportedRoutes();

// Check status manually
const status = await checkBridgeStatus(attestationHash, destChainId);
```

## User Flow

### Typical Use Case

1. **User has USDC on Arc** (Low Risk Vault)
2. **Wants to access High Risk strategy** on World Chain
3. **Navigates to Bridge page** (`/bridge`)
4. **Selects route**: Arc → World Chain
5. **Enters amount**: 500 USDC
6. **Approves transaction** (via Circle wallet PIN)
7. **Waits 15-25 minutes** for completion
8. **Deposits into World vault** once funds arrive

### Bridge Interface Features

- **Chain Selection**: Visual vault info with risk levels
- **Amount Input**: USDC denomination with validation
- **Recipient Option**: Send to different address
- **Estimates**: Show time and fees
- **Status Tracking**: Real-time transfer status
- **Error Handling**: Clear error messages

## Integration Points

### With Circle Wallets

The bridge works seamlessly with Circle's Programmable Wallets:

- User approves transfer with PIN
- Transaction signed via MPC
- No need for browser wallets or private key management

### With Vault Contracts

After bridging:

1. User receives native USDC on destination chain
2. Can immediately deposit into destination vault
3. All vault interactions use same Circle wallet

### With Dashboard

The dashboard shows:

- Available balances on each chain
- Bridge button for quick access
- Transaction history including bridges

## Security Considerations

### Circle CCTP Benefits

- **Native USDC**: No wrapped tokens or bridge vulnerabilities
- **Official Protocol**: Circle-operated, highly secure
- **Atomic Transfers**: Either completes fully or reverts
- **No Lock-Up**: Funds never locked in bridge contracts

### Best Practices

1. **Always verify destination address**
2. **Check gas availability** on both chains
3. **Monitor transfer status** until completion
4. **Keep attestation hash** for tracking
5. **Wait for confirmations** before assuming completion

## Troubleshooting

### Transfer Stuck

If transfer is taking longer than expected:

1. Check transaction on source chain explorer
2. Verify attestation status via Circle API
3. Contact Circle support with attestation hash

### Transfer Failed

Common reasons:

- Insufficient USDC balance
- Insufficient gas on source chain
- Network connectivity issues
- Chain RPC issues

### Refunds

CCTP transfers are atomic:

- If burn succeeds but mint fails, Circle will handle
- Keep attestation hash for support
- Typically resolved within 24 hours

## Testing

### Testnet Faucets

Get testnet USDC for testing:

- **Arc**: [Arc Faucet](https://faucet.arc.network)
- **Celo**: [Celo Faucet](https://faucet.celo.org)
- **World**: Contact World Chain support

### Test Scenarios

1. **Small Transfer**: Bridge 1 USDC
2. **Cross-Chain Deposit**: Bridge then deposit
3. **Round Trip**: Bridge A→B→A
4. **Multiple Bridges**: Test all routes
5. **Error Cases**: Test with insufficient balance

## Future Enhancements

### Planned Features

1. **Batch Bridging**: Bridge to multiple chains in one transaction
2. **Auto-Deposit**: Bridge + deposit in single flow
3. **Bridge History**: Track all bridge transactions
4. **Price Alerts**: Notify when bridge fees are low
5. **Route Optimization**: Suggest optimal bridge routes

### Solana Support

Bridge Kit supports Solana. Future version could include:

- Bridge USDC to/from Solana
- Access Solana-based strategies
- Solana vault contracts

## API Reference

### Types

```typescript
interface BridgeTransferParams {
  sourceChainId: SupportedChainId;
  destinationChainId: SupportedChainId;
  amount: string;
  senderAddress: `0x${string}`;
  recipientAddress: `0x${string}`;
}

interface BridgeTransferStatus {
  attestationHash?: string;
  transactionHash?: string;
  status: "pending" | "attested" | "completed" | "failed";
  message?: string;
}

type SupportedChainId = 5042002 | 44787 | 4801;
```

### Chain Configuration

```typescript
import {
  SUPPORTED_CHAINS,
  USDC_ADDRESSES,
  VAULT_ADDRESSES,
  getChainById,
  getUSDCAddress,
  getVaultInfo,
  isSupportedChain,
  getChainName,
} from "@/lib/bridge";
```

## Resources

- [Circle Bridge Kit Docs](https://developers.circle.com/bridge-kit)
- [CCTP Overview](https://developers.circle.com/cctp)
- [Viem Documentation](https://viem.sh)
- [Wagmi Documentation](https://wagmi.sh)

## Support

For bridge-related issues:

1. Check transaction status on block explorer
2. Review attestation via Circle API
3. Contact Circle developer support
4. Open issue in project repository

---

**Last Updated**: November 2025
**Version**: 1.0.0
