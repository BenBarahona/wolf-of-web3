# Testnet Configuration Verification

## ⚠️ IMPORTANT: Chain IDs Need Verification

I've updated the RPC URLs to use your Alchemy testnet endpoints, but the **chain IDs need to be verified** for the correct testnets:

### Current Configuration (Needs Verification)

| Chain               | Current Chain ID | RPC URL                  | Status         |
| ------------------- | ---------------- | ------------------------ | -------------- |
| Arc L2 Testnet      | 5042002          | ✅ Alchemy Arc Testnet   | Likely Correct |
| Celo Sepolia        | 11155111         | ✅ Alchemy Celo Sepolia  | **VERIFY**     |
| World Chain Sepolia | 4801             | ✅ Alchemy World Sepolia | **VERIFY**     |

## How to Find Correct Chain IDs

### Method 1: Check Alchemy Dashboard

1. Go to your Alchemy dashboard
2. Click on each app/network
3. Look for "Chain ID" in the network details

### Method 2: Query the RPC Directly

```bash
# Arc Testnet
curl -X POST https://arc-testnet.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# World Chain Sepolia
curl -X POST https://worldchain-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Celo Sepolia
curl -X POST https://celo-sepolia.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

The response will look like:

```json
{ "jsonrpc": "2.0", "id": 1, "result": "0x4ce2e" }
```

Convert the hex result to decimal to get the chain ID:

```javascript
parseInt("0x4ce2e", 16); // Example: 314094
```

### Method 3: Check Chain List

Visit: https://chainlist.org

Search for:

- "World Chain Sepolia"
- "Celo Sepolia"

## USDC Addresses for Testnets

The USDC addresses you provided earlier may need to be updated if switching testnets:

### Previously Provided (Verify for Correct Testnet)

```typescript
Arc: 0x3600000000000000000000000000000000000000;
Celo: 0x01c5c0122039549ad1493b8220cabedd739bc44e; // Was for Alfajores, verify for Sepolia
World: 0x66145f38cbac35ca6f1dfb4914df98f1614aea88; // Was for mainnet, verify for Sepolia
```

### Where to Find Testnet USDC Addresses

1. **Circle Documentation**: https://developers.circle.com/cctp/supported-chains
2. **Contract Deployments**: Check Circle's official testnet deployments
3. **Testnet Faucets**: Often list the USDC contract address

## Quick Fix Steps

### Step 1: Verify Chain IDs

Run the curl commands above to get the actual chain IDs.

### Step 2: Update `chains.config.ts`

```typescript
// Update with correct chain IDs
export const celoChain = {
  id: YOUR_VERIFIED_CHAIN_ID, // Replace with actual chain ID
  // ... rest of config
};

export const worldChain = {
  id: YOUR_VERIFIED_CHAIN_ID, // Replace with actual chain ID
  // ... rest of config
};
```

### Step 3: Update USDC Addresses

```typescript
export const USDC_ADDRESSES: Record<SupportedChainId, `0x${string}`> = {
  [arcChain.id]: "0x...", // Verify Arc testnet USDC
  [celoChain.id]: "0x...", // Get Celo Sepolia USDC
  [worldChain.id]: "0x...", // Get World Sepolia USDC
};
```

### Step 4: Verify Vault Deployments

Make sure your vault contracts are deployed on the correct testnets:

```typescript
// In chains.config.ts
export const VAULT_ADDRESSES = {
  [arcChain.id]: {
    address: process.env.NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS,
    // Verify this is deployed on Arc testnet
  },
  [celoChain.id]: {
    address: "0x56C4c8dbb6E9598b90119686c40271a969e1eE44",
    // Verify this is deployed on Celo Sepolia
  },
  [worldChain.id]: {
    address: "0x56C4c8dbb6E9598b90119686c40271a969e1eE44",
    // Verify this is deployed on World Sepolia
  },
};
```

## Testing After Configuration

### Test 1: Check RPC Connection

```bash
cd frontend
yarn dev
```

Open browser console and run:

```javascript
// Test Arc connection
fetch("https://arc-testnet.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_chainId",
    params: [],
    id: 1,
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

### Test 2: Verify Chain Detection

In your app, check if Wagmi correctly detects the chains:

```javascript
import { useChainId } from "wagmi";

function TestComponent() {
  const chainId = useChainId();
  console.log("Current chain ID:", chainId);
  return <div>Chain ID: {chainId}</div>;
}
```

### Test 3: Check Contract Calls

Try reading from a vault contract to verify it's deployed on the correct network.

## Common Chain IDs Reference

For reference, here are some common testnet chain IDs:

| Network          | Chain ID | Type    |
| ---------------- | -------- | ------- |
| Ethereum Sepolia | 11155111 | Testnet |
| Base Sepolia     | 84532    | Testnet |
| Optimism Sepolia | 11155420 | Testnet |
| Arbitrum Sepolia | 421614   | Testnet |
| Polygon Amoy     | 80002    | Testnet |
| Celo Alfajores   | 44787    | Testnet |

**Note**: World Chain Sepolia and Celo Sepolia IDs need to be verified from official docs or RPC calls.

## Files That Need Updates

After verifying chain IDs and USDC addresses, update these files:

1. ✅ `frontend/lib/bridge/chains.config.ts` - Already updated with RPC URLs
2. ⚠️ Update chain IDs in `chains.config.ts` after verification
3. ⚠️ Update USDC addresses in `chains.config.ts` after verification
4. 📝 Update documentation files with correct testnet info

## Support Resources

- **Alchemy Docs**: https://docs.alchemy.com/
- **Circle CCTP Docs**: https://developers.circle.com/cctp
- **World Chain Docs**: https://docs.worldcoin.org/
- **Celo Docs**: https://docs.celo.org/

## Next Steps

1. ✅ RPC URLs updated to Alchemy testnet endpoints
2. ⏳ Verify chain IDs using methods above
3. ⏳ Verify USDC addresses for each testnet
4. ⏳ Confirm vault contracts are deployed on correct networks
5. ⏳ Test bridge functionality with correct configuration

---

**Once you verify the chain IDs and USDC addresses, update `chains.config.ts` and you'll be ready to test!**
