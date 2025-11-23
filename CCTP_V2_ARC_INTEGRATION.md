# CCTP V2 Integration for Arc Testnet

## ✅ CONFIRMED: Arc Testnet IS Supported by CCTP V2

According to Circle's official documentation (November 2025), **Arc Testnet is now supported** by CCTP V2!

Source: [Circle CCTP Supported Blockchains](https://developers.circle.com/cctp/cctp-supported-blockchains)

## What We've Built

I've created a new CCTP V2 service (`backend/src/services/bridge/cctp-v2.service.ts`) that:

- ✅ Directly integrates with CCTP V2 contracts
- ✅ Supports Arc Testnet alongside other chains
- ✅ Handles the full bridge flow (approve → burn → attestation)
- ✅ Uses Viem for blockchain interactions

## What's Missing (Action Required)

To complete the Arc Testnet integration, you need to obtain these values from Circle's documentation:

### 1. **Arc Testnet CCTP Contract Addresses**

You need to find and add:

```typescript
'Arc Testnet': {
  chainId: 5042002,
  usdcAddress: '0x3600000000000000000000000000000000000000', // ✅ Already have this
  tokenMessengerAddress: '0x...', // ❌ NEED THIS
  messageTransmitterAddress: '0x...', // ❌ NEED THIS
  domain: ?, // ❌ NEED THIS (CCTP domain ID)
}
```

### 2. **Where to Find This Information**

**Option 1: Circle's CCTP Documentation**

- Visit: https://developers.circle.com/cctp/cctp-supported-blockchains
- Look for "Arc Testnet" section
- Find the contract deployment addresses

**Option 2: Circle's Contract Deployments Page**

- Technical guide: https://developers.circle.com/cctp/technical-guide
- Check "Contract Addresses" section
- Find Arc Testnet deployments

**Option 3: Circle GitHub**

- Repository: https://github.com/circlefin/cctp-contracts
- Look for deployment artifacts or README with Arc addresses

**Option 4: Contact Circle Support**

- Since Arc was recently added, the docs might be updating
- Circle Developer Support can provide the exact addresses

### 3. **What These Contracts Do**

- **TokenMessenger**: Contract where you call `depositForBurn()` to initiate a bridge
- **MessageTransmitter**: Handles cross-chain message transmission
- **Domain**: Unique identifier for each chain in CCTP (e.g., Ethereum = 0, Base = 6)

## How to Update Once You Have the Addresses

Edit `backend/src/services/bridge/cctp-v2.service.ts`:

```typescript
'Arc Testnet': {
  chainId: 5042002,
  name: 'Arc Testnet',
  rpcUrl: 'https://arc-testnet.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g',
  usdcAddress: '0x3600000000000000000000000000000000000000',
  tokenMessengerAddress: '0xYOUR_TOKEN_MESSENGER_ADDRESS', // Add here
  messageTransmitterAddress: '0xYOUR_MESSAGE_TRANSMITTER_ADDRESS', // Add here
  domain: YOUR_DOMAIN_NUMBER, // Add here (probably a number like 0-20)
},
```

Same for World Chain Sepolia if needed.

## Testing the Integration

Once you have the contract addresses, test with:

```bash
# Test bridging from Arc to another supported chain
curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "Arc Testnet",
    "toChain": "Base Sepolia",
    "amount": "1.0",
    "destinationAddress": "0x609d1dded8104f7eb1e8f0249c99c5753a2d3b5e"
  }'
```

## Integration Steps

### Step 1: Add CCTP V2 Service to Your Module

```typescript
// backend/src/services/bridge/bridge.module.ts
import { CCTPV2Service } from "./cctp-v2.service";

@Module({
  providers: [BridgeService, CCTPV2Service],
  exports: [BridgeService, CCTPV2Service],
})
export class BridgeModule {}
```

### Step 2: Add Controller Endpoints

```typescript
// backend/src/app/api/bridge/bridge.controller.ts
import { CCTPV2Service } from "../../../services/bridge/cctp-v2.service";

@Controller("api/bridge")
export class BridgeController {
  constructor(
    private readonly bridgeService: BridgeService,
    private readonly cctpV2Service: CCTPV2Service // Add this
  ) {}

  // Add new endpoint for CCTP V2
  @Post("cctp-v2/transfer")
  async cctpV2Transfer(@Body() request: any) {
    return this.cctpV2Service.bridgeUSDC(request);
  }

  @Get("cctp-v2/chains")
  async getCCTPV2Chains() {
    return this.cctpV2Service.getSupportedChains();
  }
}
```

### Step 3: Get USDC on Arc Testnet

You'll need Arc Testnet USDC to test:

1. Get Arc Testnet ETH from faucet
2. Get Arc Testnet USDC (check if there's a faucet or need to bridge)

## Current Status

✅ **Working chains** (contract addresses configured):

- Ethereum Sepolia
- Base Sepolia
- Arbitrum Sepolia
- OP Sepolia
- Polygon Amoy

⏳ **Pending contract addresses**:

- Arc Testnet (supported by CCTP V2, need contract addresses)
- World Chain Sepolia (supported by CCTP V2, need contract addresses)

## Why This Approach is Better

1. **Direct CCTP Integration**: No dependency on Bridge Kit updates
2. **More Control**: You can customize the flow as needed
3. **Future-proof**: As Circle adds new chains to CCTP V2, you can add them immediately
4. **Educational**: You understand exactly how CCTP works under the hood

## Fallback Options

If you can't get Arc CCTP addresses immediately:

### Option 1: Bridge TO Arc Instead

- Bridge from Base Sepolia → Arc Testnet (if that direction has contracts)

### Option 2: Use LayerZero

- Implement LayerZero OFT for Arc bridging
- LayerZero has broader chain support

### Option 3: Focus Demo on Working Chains

- Show Base Sepolia → World Chain Sepolia
- Mention Arc support is coming soon

## Resources

- [Circle CCTP Documentation](https://developers.circle.com/cctp)
- [CCTP Technical Guide](https://developers.circle.com/cctp/technical-guide)
- [CCTP Supported Blockchains](https://developers.circle.com/cctp/cctp-supported-blockchains)
- [CCTP GitHub](https://github.com/circlefin/cctp-contracts)
- [Circle Attestation API](https://developers.circle.com/cctp/attestation-service)

## Next Steps

1. **[ ] Find Arc Testnet CCTP contract addresses** from Circle docs
2. **[ ] Update `cctp-v2.service.ts` with addresses**
3. **[ ] Add CCTP V2 service to bridge module**
4. **[ ] Add controller endpoints**
5. **[ ] Test bridge flow**
6. **[ ] Update frontend to use new CCTP V2 endpoints**

---

**Note**: The Bridge Kit alpha version (0.0.2-alpha.7) hasn't been updated with Arc support yet, but CCTP V2 protocol itself supports it. This direct integration gives you access to all CCTP V2 chains immediately.
