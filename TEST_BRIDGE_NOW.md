# Test Bridge Integration NOW! 🚀

## Quick 5-Minute Test

### Step 1: Start the Frontend (30 seconds)

```bash
cd frontend
yarn dev
```

Visit: http://localhost:3000

### Step 2: Navigate to Bridge (10 seconds)

Click the **Bridge** icon in the bottom navigation (arrows icon)

Or go directly to: http://localhost:3000/bridge

### Step 3: View the Bridge Interface (1 minute)

You should see:

- ✅ Chain selector dropdowns
- ✅ Amount input field
- ✅ Recipient address field
- ✅ Bridge button
- ✅ Info cards explaining the process

### Step 4: Check the Configuration (2 minutes)

Open browser console and run:

```javascript
// Check if bridge library is loaded
console.log("Bridge config loaded:", !!window);

// Check chain configuration
import {
  SUPPORTED_CHAINS,
  USDC_ADDRESSES,
  VAULT_ADDRESSES,
} from "@/lib/bridge";
console.log("Supported chains:", SUPPORTED_CHAINS);
console.log("USDC addresses:", USDC_ADDRESSES);
console.log("Vault addresses:", VAULT_ADDRESSES);
```

### Step 5: View All Vaults (1 minute)

Go to: http://localhost:3000/dashboard

You should see all three vaults:

- 🟢 Arc L2 Testnet - Low Risk Lending Vault
- 🟡 Celo Alfajores - Medium Risk Staking Vault
- 🔴 World Chain - High Risk Meme Index Vault

---

## Full Integration Test (With Testnet Funds)

### Prerequisites

1. **Get Testnet USDC**

   ```bash
   # Arc Testnet Faucet
   https://faucet.arc.network

   # Celo Alfajores Faucet
   https://faucet.celo.org

   # World Chain
   # Contact World Chain support for testnet tokens
   ```

2. **Set Environment Variables**
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS=<your-arc-vault-address>
   ```

### Test Case 1: Arc → World Bridge

```
Goal: Bridge 10 USDC from Arc (Low Risk) to World (High Risk)
Time: ~20 minutes
```

**Steps:**

1. Navigate to `/bridge`
2. Select "Arc L2 Testnet" as source
3. Select "World Chain" as destination
4. Enter amount: `10`
5. Leave recipient blank (sends to yourself)
6. Click "Bridge USDC"
7. Enter Circle wallet PIN
8. Wait for completion

**Expected Results:**

- ✅ Transaction hash displayed
- ✅ Attestation hash displayed
- ✅ Status updates every 30 seconds
- ✅ Completion message after ~20 minutes
- ✅ Balance updated on World Chain

### Test Case 2: Check Portfolio View

```
Goal: View multi-chain holdings
Time: 1 minute
```

**Steps:**

1. Navigate to `/dashboard`
2. Scroll to "Multi-Chain Portfolio" section
3. Check diversity score
4. View vault cards
5. Check recommendations

**Expected Results:**

- ✅ See all three vaults
- ✅ Holdings shown for chains with deposits
- ✅ Diversity score calculated
- ✅ Recommendations if not fully diversified

### Test Case 3: All Routes

Test all 6 possible routes:

```bash
# Low → Medium
Arc → Celo (5 USDC)

# Low → High
Arc → World (5 USDC)

# Medium → Low
Celo → Arc (3 USDC)

# Medium → High
Celo → World (3 USDC)

# High → Low
World → Arc (2 USDC)

# High → Medium
World → Celo (2 USDC)
```

For each route, verify:

- ✅ Source balance decreases
- ✅ Destination balance increases
- ✅ Status tracking works
- ✅ No errors in console

---

## Visual Checklist

### Bridge Interface (/bridge)

```
┌─────────────────────────────────────┐
│ Cross-Chain Bridge                  │
│                                     │
│ [Connect Wallet Button]            │ ← Shows if not connected
│                                     │
│ From Chain:                         │
│ [Arc L2 Testnet ▼]                 │ ← Dropdown with 3 chains
│ ┌─────────────────────────────┐   │
│ │ Low-risk lending strategies │   │ ← Info card
│ └─────────────────────────────┘   │
│                                     │
│ To Chain:                           │
│ [World Chain ▼]                    │ ← Dropdown with 2 chains
│ ┌─────────────────────────────┐   │
│ │ High-risk meme coin index   │   │ ← Info card
│ └─────────────────────────────┘   │
│                                     │
│ Amount (USDC):                      │
│ [10.00                          ]  │ ← Number input
│                                     │
│ Recipient (optional):               │
│ [0x...                          ]  │ ← Address input
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Estimated Time: 15-25 min   │   │ ← Estimates
│ │ Estimated Fee: 0.01 USDC    │   │
│ │ You Receive: ~9.99 USDC     │   │
│ └─────────────────────────────┘   │
│                                     │
│ [     Bridge USDC     ]            │ ← Main button
│                                     │
└─────────────────────────────────────┘
```

### Multi-Chain Portfolio (/dashboard)

```
┌─────────────────────────────────────┐
│ Multi-Chain Portfolio               │
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────────┐       │
│ │Total│ │Active│ │Diversity│       │
│ │ $150│ │ 3/3 │ │  85/100 │       │
│ └─────┘ └─────┘ └─────────┘       │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 💡 Add to World Chain vault │   │ ← Smart tip
│ │    to improve diversity     │   │
│ └─────────────────────────────┘   │
│                                     │
│ [All] [Low] [Med] [High]           │ ← Risk filter
│                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ Arc  │ │ Celo │ │World │        │ ← Vault cards
│ │ Low  │ │ Med  │ │ High │        │
│ │$50   │ │$50   │ │$50   │        │
│ └──────┘ └──────┘ └──────┘        │
│                                     │
└─────────────────────────────────────┘
```

---

## Browser Console Commands

### Check Integration Status

```javascript
// In browser console:

// 1. Check if components loaded
console.log("Bridge page:", document.querySelector("[data-bridge]"));

// 2. Check chain config
const chains = [
  { name: "Arc", id: 5042002 },
  { name: "Celo", id: 44787 },
  { name: "World", id: 4801 },
];
console.table(chains);

// 3. Check USDC addresses
const usdc = {
  Arc: "0x3600000000000000000000000000000000000000",
  Celo: "0x01C5C0122039549AD1493B8220cABEdD739BC44E",
  World: "0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88",
};
console.table(usdc);

// 4. Check vault addresses
const vaults = {
  Arc: process.env.NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS,
  Celo: "0x56C4c8dbb6E9598b90119686c40271a969e1eE44",
  World: "0x56C4c8dbb6E9598b90119686c40271a969e1eE44",
};
console.table(vaults);
```

### Monitor Bridge Transaction

```javascript
// After initiating a bridge:

// 1. Copy transaction hash
const txHash = "0x..."; // From UI

// 2. Copy attestation hash
const attestation = "0x..."; // From UI

// 3. Check on explorers
const explorers = {
  Arc: `https://explorer.testnet.arc.network/tx/${txHash}`,
  Celo: `https://alfajores.celoscan.io/tx/${txHash}`,
  World: `https://worldscan.org/tx/${txHash}`,
};

// 4. Check attestation
const attestUrl = `https://iris-api.circle.com/v1/attestations/${attestation}`;
fetch(attestUrl)
  .then((r) => r.json())
  .then(console.log);
```

---

## Expected Timings

| Step           | Expected Time     | What's Happening                    |
| -------------- | ----------------- | ----------------------------------- |
| PIN Entry      | 5 seconds         | User enters 6-digit PIN             |
| Tx Submission  | 10 seconds        | Transaction sent to source chain    |
| Source Confirm | 5-10 minutes      | Block confirmations on source chain |
| Attestation    | 2-5 minutes       | Circle validates and signs          |
| Dest Minting   | 5-10 minutes      | USDC minted on destination          |
| **Total**      | **15-25 minutes** | End-to-end bridge time              |

---

## Troubleshooting

### Issue: Bridge button disabled

**Check:**

- [ ] Wallet connected?
- [ ] Source chain selected?
- [ ] Destination chain selected?
- [ ] Valid amount entered?

### Issue: Transaction fails

**Check:**

- [ ] Sufficient USDC balance?
- [ ] Sufficient gas (ETH/CELO)?
- [ ] Network connectivity?
- [ ] RPC endpoints working?

### Issue: Status stuck on "pending"

**Solution:**

- Wait 30 minutes
- Check transaction on block explorer
- Verify with Circle attestation API
- If still stuck after 1 hour, contact Circle support

### Issue: Can't see vaults

**Check:**

- [ ] Wagmi config loaded?
- [ ] RPC endpoints accessible?
- [ ] Contract addresses correct?
- [ ] Environment variables set?

---

## Success Indicators

### ✅ You know it's working when:

1. **Bridge page loads**
   - No console errors
   - Dropdowns populated with 3 chains
   - Info cards show vault descriptions

2. **Can select chains**
   - Source dropdown shows 3 options
   - Destination dropdown shows 2 options (excluding source)
   - Vault info appears below each dropdown

3. **Can enter amount**
   - Number input accepts decimals
   - Estimates update when amount changes
   - Bridge button enables when valid

4. **Transaction submits**
   - PIN prompt appears
   - After PIN, loading state shows
   - Transaction hash appears
   - Status tracking begins

5. **Status updates**
   - Status changes from "pending"
   - Attestation hash appears
   - Updates every 30 seconds
   - Eventually shows "completed"

6. **Balance updates**
   - Source chain balance decreases
   - Destination chain balance increases
   - Portfolio view reflects new balances

---

## Performance Benchmarks

| Metric          | Target  | Good    | Needs Work |
| --------------- | ------- | ------- | ---------- |
| Page Load       | < 2s    | < 5s    | > 5s       |
| Chain Switch    | < 1s    | < 2s    | > 2s       |
| Amount Input    | Instant | < 500ms | > 1s       |
| TX Submit       | < 10s   | < 30s   | > 30s      |
| Status Poll     | 30s     | 60s     | > 120s     |
| Bridge Complete | 15-20m  | 20-25m  | > 30m      |

---

## Next Steps After Testing

1. **If everything works:**
   - ✅ Mark integration as complete
   - ✅ Document any issues found
   - ✅ Prepare for user testing
   - ✅ Plan mainnet deployment

2. **If issues found:**
   - 📝 Note specific error messages
   - 📝 Check browser console
   - 📝 Check network tab
   - 📝 Review relevant code
   - 📝 Fix and retest

3. **Before mainnet:**
   - [ ] Test with real money (small amounts)
   - [ ] Verify all contracts on mainnets
   - [ ] Update USDC addresses for mainnet
   - [ ] Set up monitoring and alerts
   - [ ] Prepare support documentation

---

## Quick Reference

### Important Files

```bash
frontend/lib/bridge/chains.config.ts      # Chain configurations
frontend/lib/bridge/bridge.service.ts     # Bridge logic
frontend/lib/bridge/hooks.ts              # React hooks
frontend/components/BridgeInterface.tsx   # UI component
frontend/app/bridge/page.tsx              # Bridge page
```

### Key URLs

```bash
# Local
http://localhost:3000/bridge           # Bridge interface
http://localhost:3000/dashboard        # Portfolio view

# Explorers
https://explorer.testnet.arc.network   # Arc transactions
https://alfajores.celoscan.io          # Celo transactions
https://worldscan.org                  # World transactions

# Circle API
https://iris-api.circle.com/v1/attestations/{hash}
```

### Support

If you get stuck:

1. Check `BRIDGE_INTEGRATION.md` for technical details
2. Check `QUICKSTART_BRIDGE.md` for usage guide
3. Check `INTEGRATION_SUMMARY.md` for overview
4. Check browser console for errors
5. Check network tab for API failures

---

**Ready to test? Let's go! 🚀**

1. `cd frontend && yarn dev`
2. Open http://localhost:3000/bridge
3. Start bridging!
