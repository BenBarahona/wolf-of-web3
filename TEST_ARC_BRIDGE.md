# Test Arc Testnet Bridge - Step by Step

## ✅ Ready to Test!

All Arc Testnet CCTP contracts are configured:

- ✅ TokenMessenger: `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`
- ✅ MessageTransmitter: `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275`
- ✅ Domain: `26`
- ✅ USDC: `0x3600000000000000000000000000000000000000`

## Step 1: Restart Your Backend

The new CCTP V2 service is now wired up. Restart the backend to load it:

```bash
cd backend
yarn dev
```

Wait for the server to start and look for:

```
[Nest] ... LOG [CCTPV2Service] CCTP V2 service initialized with Arc Testnet support
```

## Step 2: Verify the Setup

Check that the CCTP V2 endpoints are working:

```bash
# Check CCTP V2 info
curl http://localhost:3001/api/bridge/cctp-v2/info | jq

# Check supported chains
curl http://localhost:3001/api/bridge/cctp-v2/chains | jq
```

You should see Arc Testnet with `configured: true`.

## Step 3: Get Arc Testnet USDC

You need USDC on Arc Testnet to test bridging FROM Arc.

### Option A: Bridge TO Arc First

Bridge USDC from a chain where you have it (e.g., Base Sepolia) TO Arc:

```bash
curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "Base Sepolia",
    "toChain": "Arc Testnet",
    "amount": "5.0",
    "destinationAddress": "0x2d3404d096586a367aecdd73e04ebb1abbd5e291"
  }' | jq
```

Replace the destination address with your bridge wallet address.

### Option B: Use Arc Faucet (if available)

Check Arc's documentation for a USDC faucet on testnet.

### Option C: Bridge from Another Source

Use another bridge service to get USDC onto Arc Testnet first.

## Step 4: Check Arc USDC Balance

Once you have USDC on Arc, check your balance:

```bash
# Using a blockchain explorer or RPC call
curl -X POST https://arc-testnet.g.alchemy.com/v2/07WgWBy375TBGHaooLi-g \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_call",
    "params": [{
      "to": "0x3600000000000000000000000000000000000000",
      "data": "0x70a082310000000000000000000000002d3404d096586a367aecdd73e04ebb1abbd5e291"
    }, "latest"]
  }' | jq
```

Or check on Arc Explorer: https://explorer.testnet.arc.network

## Step 5: Test Bridge FROM Arc

Now test bridging FROM Arc Testnet TO another chain:

### Test 1: Arc → Base Sepolia

```bash
curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "Arc Testnet",
    "toChain": "Base Sepolia",
    "amount": "1.0",
    "destinationAddress": "0x2d3404d096586a367aecdd73e04ebb1abbd5e291"
  }' | jq
```

### Test 2: Arc → Ethereum Sepolia

```bash
curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "Arc Testnet",
    "toChain": "Ethereum Sepolia",
    "amount": "0.5",
    "destinationAddress": "0x2d3404d096586a367aecdd73e04ebb1abbd5e291"
  }' | jq
```

## Step 6: Monitor the Transaction

The response will include:

- `burnTxHash`: Transaction on source chain (Arc)
- `attestationAPI`: Where to check attestation status

### Check Transaction on Arc

Visit: https://explorer.testnet.arc.network/tx/[BURN_TX_HASH]

### Check Attestation Status

```bash
# Wait ~20 seconds after burn transaction, then check attestation
curl "https://iris-api-sandbox.circle.com/v1/attestations/[MESSAGE_HASH]" | jq
```

The message hash can be found in the burn transaction logs.

### Wait for Mint on Destination

CCTP will automatically mint on the destination chain. This usually takes:

- **Fast path**: 10-20 seconds
- **Slow path**: 10-20 minutes

## Step 7: Verify Receipt on Destination

Check your balance on the destination chain to confirm the USDC arrived.

For Base Sepolia:

- Explorer: https://sepolia.basescan.org/address/YOUR_ADDRESS

For Ethereum Sepolia:

- Explorer: https://sepolia.etherscan.io/address/YOUR_ADDRESS

## Expected Flow

```
1. Approve USDC spend on source chain (Arc)
   ↓
2. Call depositForBurn on TokenMessenger
   ↓
3. USDC burned on Arc, event emitted
   ↓
4. Circle attestation service signs the burn
   ↓
5. CCTP automatically mints on destination chain
   ↓
6. USDC appears in your wallet on destination
```

## Troubleshooting

### Error: "Insufficient USDC balance"

- Make sure you have USDC on Arc Testnet
- Check your bridge wallet address: `GET /api/bridge/cctp-v2/info`

### Error: "Contract not configured"

- The service should now return this is configured
- Restart the backend if you just made changes

### Transaction stuck at "burn" step

- Check Arc Explorer for the transaction
- Verify the TokenMessenger contract was called successfully

### Attestation not available

- Wait at least 20 seconds after burn transaction
- Check https://iris-api-sandbox.circle.com/v1/attestations/[MESSAGE_HASH]

### Mint not happening on destination

- CCTP V2 should auto-mint, but timing varies
- Check destination chain explorer for incoming transaction
- May take up to 20 minutes in slow path

## Full Integration Test

Test all supported routes:

```bash
# Test script for all routes
for FROM in "Arc Testnet" "Base Sepolia" "Ethereum Sepolia"; do
  for TO in "Arc Testnet" "Base Sepolia" "Ethereum Sepolia"; do
    if [ "$FROM" != "$TO" ]; then
      echo "Testing: $FROM → $TO"
      curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
        -H "Content-Type: application/json" \
        -d "{
          \"fromChain\": \"$FROM\",
          \"toChain\": \"$TO\",
          \"amount\": \"0.1\",
          \"destinationAddress\": \"0x2d3404d096586a367aecdd73e04ebb1abbd5e291\"
        }" | jq '.success, .message'
      echo "---"
    fi
  done
done
```

## Success Indicators

✅ Backend starts without errors
✅ CCTP V2 endpoints respond
✅ Arc Testnet shows as `configured: true`
✅ Approve transaction succeeds
✅ Burn transaction succeeds
✅ Attestation is available after ~20 seconds
✅ USDC appears on destination chain

## Next Steps After Testing

Once Arc bridging works:

1. **Update Frontend**: Add CCTP V2 bridge option in the UI
2. **Add to Demo**: Show Arc ↔ Base/Ethereum bridging
3. **Document Routes**: Update user docs with supported routes
4. **Monitor Performance**: Track bridge times and costs
5. **Add World Chain**: Find World Chain Sepolia CCTP contracts next!

---

**You're ready to test!** 🚀

Make sure your bridge wallet has:

- Arc Testnet ETH (for gas)
- Arc Testnet USDC (to bridge)

Then follow the steps above to test your first Arc → other chain bridge!
