# Fix Private Key Error

## The Error

```
CCTP V2 bridge failed: invalid private key, expected hex or 32 bytes, got string
```

## What I Fixed

Updated `cctp-v2.service.ts` to:

1. ✅ Automatically add `0x` prefix if missing
2. ✅ Validate private key length
3. ✅ Show clear error messages
4. ✅ Log the account address being used

## How to Check Your Private Key

### Step 1: Check Your `.env` File

Your private key should be in `backend/.env`:

```bash
cat backend/.env | grep BRIDGE_WALLET_PRIVATE_KEY
```

### Step 2: Verify the Format

The private key should be:

- **64 hexadecimal characters** (0-9, a-f)
- **With or without** `0x` prefix (the code now handles both)
- **No spaces or extra characters**

**Good formats:**

```bash
BRIDGE_WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
BRIDGE_WALLET_PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

**Bad formats:**

```bash
BRIDGE_WALLET_PRIVATE_KEY="0x123..."  # ❌ Don't use quotes
BRIDGE_WALLET_PRIVATE_KEY=0x123...456  # ❌ Too short
BRIDGE_WALLET_PRIVATE_KEY=privatekey   # ❌ Not hex
```

### Step 3: Restart the Backend

After updating the `.env` file:

```bash
cd backend
# Stop the server (Ctrl+C if running)
yarn dev
```

### Step 4: Test Again

Look in the backend logs for:

```
[Nest] ... LOG [CCTPV2Service] Creating account from private key...
[Nest] ... LOG [CCTPV2Service] Account address: 0x...
```

This confirms:

- ✅ Private key is valid
- ✅ Account address matches your bridge wallet

## Common Issues

### Issue 1: Private Key is Encrypted

If you exported from MetaMask or another wallet, you might have:

- A **JSON keystore file** (needs password)
- An **encrypted private key**

**Solution**: You need the **raw private key**.

In MetaMask:

1. Click the three dots next to your account
2. Account Details → Show Private Key
3. Enter password
4. Copy the private key (should start with `0x` and be 66 chars long)

### Issue 2: Using Mnemonic Instead

If you have a **seed phrase** (12 or 24 words), that's not the private key.

**Solution**: Use the mnemonic to derive the private key:

```typescript
// In Node.js
import { mnemonicToAccount } from "viem/accounts";

const account = mnemonicToAccount("your twelve word seed phrase here...");
console.log("Private Key:", account.privateKey);
console.log("Address:", account.address);
```

### Issue 3: Wrong Environment File

Make sure you're editing the right `.env` file:

```bash
# Check which .env files exist
ls -la backend/.env*
ls -la .env*

# The backend uses backend/.env
```

### Issue 4: Private Key Not Loading

Check if the environment variable is actually loaded:

```bash
# Add this temporarily to backend/src/services/bridge/cctp-v2.service.ts
constructor(private configService: ConfigService) {
  this.bridgeWalletPrivateKey = this.configService.get<string>('BRIDGE_WALLET_PRIVATE_KEY');

  // Debug log
  console.log('Private key loaded:', this.bridgeWalletPrivateKey ? 'Yes' : 'No');
  console.log('Private key length:', this.bridgeWalletPrivateKey?.length || 0);
}
```

## Testing the Fix

### Test 1: Check Backend Startup

Restart backend and look for:

```
[Nest] ... LOG [CCTPV2Service] CCTP V2 service initialized with Arc Testnet support
```

Should NOT see:

```
[Nest] ... WARN [CCTPV2Service] BRIDGE_WALLET_PRIVATE_KEY not configured
```

### Test 2: Try a Simple Transfer

```bash
curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "Base Sepolia",
    "toChain": "Ethereum Sepolia",
    "amount": "0.1",
    "destinationAddress": "0x2d3404d096586a367aecdd73e04ebb1abbd5e291"
  }' | jq
```

Look for in the logs:

```
[Nest] ... LOG [CCTPV2Service] Creating account from private key...
[Nest] ... LOG [CCTPV2Service] Account address: 0x...
```

If you see a different error (like "insufficient balance"), that's progress! The private key is now working.

### Test 3: Verify Account Address

The account address shown in logs should match your bridge wallet:

```bash
# Get info
curl http://localhost:3001/api/bridge/cctp-v2/info | jq '.wallet'
```

Should show:

```json
{
  "address": "0x2d3404d096586a367aecdd73e04ebb1abbd5e291",
  "isConfigured": true
}
```

## Quick Fix Script

If you're still having issues, run this to validate:

```bash
cd backend

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ No .env file found!"
  echo "Create backend/.env with BRIDGE_WALLET_PRIVATE_KEY=..."
  exit 1
fi

# Check if variable is set
if grep -q "BRIDGE_WALLET_PRIVATE_KEY=" .env; then
  echo "✅ BRIDGE_WALLET_PRIVATE_KEY found in .env"

  # Get the value (without exposing it)
  KEY=$(grep "BRIDGE_WALLET_PRIVATE_KEY=" .env | cut -d'=' -f2)
  LENGTH=${#KEY}

  echo "Private key length: $LENGTH characters"

  if [ $LENGTH -eq 66 ]; then
    echo "✅ Length is correct (66 chars with 0x prefix)"
  elif [ $LENGTH -eq 64 ]; then
    echo "✅ Length is correct (64 chars, will add 0x prefix automatically)"
  else
    echo "❌ Wrong length! Should be 64 or 66 characters"
    echo "Current: $LENGTH characters"
  fi

  if [[ $KEY == 0x* ]]; then
    echo "✅ Has 0x prefix"
  else
    echo "⚠️  No 0x prefix (will be added automatically)"
  fi
else
  echo "❌ BRIDGE_WALLET_PRIVATE_KEY not found in .env"
  echo "Add this line to backend/.env:"
  echo "BRIDGE_WALLET_PRIVATE_KEY=your_private_key_here"
fi
```

Save as `check-private-key.sh` and run:

```bash
chmod +x check-private-key.sh
./check-private-key.sh
```

## Expected Result

After fixing, you should see:

### In Backend Logs:

```
[Nest] ... LOG [CCTPV2Service] Creating account from private key...
[Nest] ... LOG [CCTPV2Service] Account address: 0x2d3404d096586a367aecdd73e04ebb1abbd5e291
[Nest] ... LOG [CCTPV2Service] Amount to bridge: 1000000 (1.0 USDC)
[Nest] ... LOG [CCTPV2Service] USDC Balance: 5000000
```

### In Frontend:

Instead of "invalid private key", you'll get:

- ✅ Success message with transaction hash, OR
- A different error (like "insufficient balance" or "contract error")

Both mean the private key is now working!

## Still Having Issues?

1. **Double-check your private key**:
   - Export fresh from wallet
   - Make sure it's the raw private key (64 hex chars)
   - No spaces, quotes, or extra characters

2. **Check permissions**:

   ```bash
   ls -la backend/.env
   # Should be readable by your user
   ```

3. **Try a different wallet**:
   - Create a new test wallet
   - Export its private key
   - Use that for testing

4. **Manual test**:
   ```bash
   # Test the private key directly with Node
   node -e "
   const { privateKeyToAccount } = require('viem/accounts');
   const pk = '0xYOUR_PRIVATE_KEY_HERE';
   const account = privateKeyToAccount(pk);
   console.log('Address:', account.address);
   "
   ```

---

**The code now handles both formats automatically, so just make sure your private key is 64 hex characters!** 🔑
