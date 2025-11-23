# Debug Fix Summary: Arc Bridge Error

## The Problem

You were getting this error:

```
INPUT_INVALID_CHAIN: Invalid chain 'unknown': Invalid input
at BridgeService.bridgeUSDC (bridge.service.ts:87:37)
```

## Root Cause

**You were calling the WRONG endpoint!**

The error showed:

- Endpoint being called: `/api/bridge/transfer` ❌
- Service being used: `BridgeService` (old Bridge Kit) ❌
- Bridge Kit: Doesn't support Arc Testnet ❌

But we built:

- New endpoint: `/api/bridge/cctp-v2/transfer` ✅
- New service: `CCTPV2Service` ✅
- CCTP V2: Supports Arc Testnet ✅

## What We Fixed

### 1. Updated Frontend to Use CCTP V2 Endpoints

**File: `frontend/lib/bridge/bridge-api.ts`**

Changed:

```typescript
// OLD - Using Bridge Kit (no Arc support)
const response = await fetch(`${BACKEND_URL}/api/bridge/transfer`, {
  // ...
});
```

To:

```typescript
// NEW - Using CCTP V2 (with Arc support)
const USE_CCTP_V2 = true;
const endpoint = USE_CCTP_V2
  ? `${BACKEND_URL}/api/bridge/cctp-v2/transfer` // ✅ This one!
  : `${BACKEND_URL}/api/bridge/transfer`;
```

### 2. Fixed Chain Name Mapping

**Also in `frontend/lib/bridge/bridge-api.ts`**

Changed:

```typescript
// OLD - Wrong names
const chainMap = {
  5042002: "Arc", // ❌ Bridge Kit expects this
  11155111: "Celo", // ❌ Wrong! This is actually Ethereum Sepolia
  4801: "World", // ❌ Bridge Kit expects this
};
```

To:

```typescript
// NEW - Correct CCTP V2 names
const chainMap = {
  5042002: "Arc Testnet", // ✅ Matches CCTP V2 service
  11155111: "Ethereum Sepolia", // ✅ Fixed!
  4801: "World Chain Sepolia", // ✅ Matches CCTP V2 service
};
```

### 3. Added Better Error Handling

```typescript
console.log("🌉 Bridge Transfer:", {
  endpoint,
  from: request.fromChain,
  to: request.toChain,
  amount: request.amount,
});
```

Now you can see in the browser console which endpoint and chains are being used.

## How the Flow Works Now

### Before (Broken):

```
Frontend
  ↓ calls /api/bridge/transfer
Backend BridgeService (Bridge Kit)
  ↓ tries to use Arc
Bridge Kit SDK
  ↓ "Arc? Never heard of it!"
❌ Error: Invalid chain 'unknown'
```

### After (Working):

```
Frontend
  ↓ calls /api/bridge/cctp-v2/transfer  ✅
Backend CCTPV2Service
  ↓ Arc Testnet: domain 26, contracts configured  ✅
CCTP V2 Smart Contracts
  ↓ depositForBurn on Arc
  ↓ attestation by Circle
  ↓ mint on destination chain
✅ Success!
```

## How to Test

### Step 1: Restart Backend (if not running)

```bash
cd backend
yarn dev
```

Look for:

```
[Nest] ... LOG [CCTPV2Service] CCTP V2 service initialized with Arc Testnet support
```

### Step 2: Rebuild/Restart Frontend

```bash
cd frontend
# If using dev server
yarn dev

# Or rebuild if needed
yarn build
```

### Step 3: Test in Browser

Open browser console (F12) and try a bridge transfer. You should see:

```
🌉 Bridge Transfer: {
  endpoint: 'http://localhost:3001/api/bridge/cctp-v2/transfer',
  from: 'Arc Testnet',
  to: 'World Chain Sepolia',
  amount: '0.92'
}
```

### Step 4: Check Backend Logs

You should see:

```
[Nest] ... LOG [BridgeController] CCTP V2 transfer request: {...}
[Nest] ... LOG [CCTPV2Service] CCTP V2 Bridge request: 0.92 USDC from Arc Testnet to World Chain Sepolia
[Nest] ... LOG [CCTPV2Service] Resolved chains: 5042002 -> 4801
[Nest] ... LOG [CCTPV2Service] CCTP Domains: 26 -> 0
```

NOT:

```
[Nest] ... LOG [BridgeService] Bridge request: ...  ❌ (This is the old service)
```

## Quick Test via Terminal

Test the new endpoint directly:

```bash
curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "Arc Testnet",
    "toChain": "Base Sepolia",
    "amount": "0.1",
    "destinationAddress": "0x2d3404d096586a367aecdd73e04ebb1abbd5e291"
  }' | jq
```

Should return:

```json
{
  "success": true/false,
  "message": "...",
  "transactionHash": "0x..."
}
```

## Troubleshooting

### Still getting "Invalid chain 'unknown'"?

- Check browser console - is it calling `/cctp-v2/transfer`?
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Make sure you rebuilt the frontend

### Getting "Contract not configured"?

- This means Arc addresses are missing
- But you already added them! Check the file was saved
- Restart backend to reload the service

### Getting "Insufficient USDC balance"?

- You need USDC on Arc Testnet
- Bridge TO Arc first from another chain:

```bash
curl -X POST http://localhost:3001/api/bridge/cctp-v2/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain": "Base Sepolia",
    "toChain": "Arc Testnet",
    "amount": "5.0",
    "destinationAddress": "YOUR_WALLET"
  }'
```

## Summary

**Before**: Frontend called old Bridge Kit endpoint → Arc not supported → Error
**After**: Frontend calls new CCTP V2 endpoint → Arc fully supported → Success! 🎉

The backend was already configured correctly. The frontend just needed to know to use the new endpoint!

## Files Changed

1. ✅ `frontend/lib/bridge/bridge-api.ts` - Switch to CCTP V2 endpoints
2. ✅ `backend/src/services/bridge/cctp-v2.service.ts` - Already had Arc configured
3. ✅ `backend/src/services/bridge/bridge.module.ts` - Already wired up
4. ✅ `backend/src/app/api/bridge/bridge.controller.ts` - Already has endpoints

## Next Steps

1. Test bridge FROM Arc to other chains
2. Test bridge TO Arc from other chains
3. Verify transactions on Arc Explorer
4. Update UI to show "CCTP V2" or "Arc-enabled" badge
5. Celebrate Arc Testnet support! 🚀
