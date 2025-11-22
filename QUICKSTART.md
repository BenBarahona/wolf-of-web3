# Wolf of Web3 - Quick Start Guide

Get your Circle Smart Wallet integration running in 5 minutes!

## Prerequisites

- Node.js 18+ and Yarn
- Circle Developer Account ([Sign up here](https://console.circle.com/))

## Step 1: Get Circle Credentials

1. Go to [Circle Developer Console](https://console.circle.com/)
2. Create a new **User-Controlled Wallets** project
3. Navigate to **Configurator** in the sidebar
4. Copy these three values:
   - **App ID**
   - **API Key**
   - **Entity Secret**

## Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
yarn install

# Create .env file
cat > .env << EOF
CIRCLE_API_KEY=your_api_key_here
CIRCLE_APP_ID=your_app_id_here
CIRCLE_ENTITY_SECRET=your_entity_secret_here
PORT=3001
EOF

# Start the backend
yarn dev
```

Backend will run on `http://localhost:3001`

## Step 3: Setup Frontend

```bash
# Open a new terminal
# Navigate to frontend
cd frontend

# Install dependencies
yarn install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Start the frontend
yarn dev
```

Frontend will run on `http://localhost:3000`

## Step 4: Test the Integration

1. Open your browser to `http://localhost:3000`
2. You should see the "Wolf of Web3" landing page
3. Click **"Create Smart Wallet"**
4. The app will:
   - Create a Circle user account
   - Show the Circle PIN setup modal
   - Create a Smart Contract Account wallet
   - Display your new wallet address

**That's it!** 🎉 You now have a working Circle Smart Wallet integration.

## What You Just Created

- ✅ **User-Controlled Wallet** - Non-custodial, user owns the keys
- ✅ **Smart Contract Account (SCA)** - Gas abstraction, advanced features
- ✅ **PIN Authentication** - No seed phrases needed
- ✅ **Arc Testnet** - Circle's Layer-1 blockchain with USDC as gas
- ✅ **Full API Integration** - Backend + Frontend working together

## Next Steps

### 1. Test Wallet Features

Try these operations in your app:

- View wallet balance
- Send transactions
- List all wallets

### 2. Add Test Funds

Get testnet USDC from the Arc Faucet:

- [Circle Arc Faucet](https://faucet.circle.com)

Paste your wallet address to receive test USDC. Note: Arc uses USDC as the native gas token!

### 3. Switch to Production

When ready for mainnet:

```env
# backend/.env
# Change to mainnet blockchain
CIRCLE_API_KEY=your_production_api_key
```

Then create wallets with:

```typescript
await createWallet("ARC", "SCA"); // Arc Mainnet (when available)
```

### 4. Customize the UI

The wallet setup component is at:

```
frontend/components/WalletSetup.tsx
```

Modify it to match your brand and UX requirements.

### 5. Add More Features

Check out `CIRCLE_INTEGRATION.md` for:

- Transaction examples
- Balance queries
- Multi-blockchain support
- Security features

## Common Issues

### "Failed to initialize Circle SDK"

- Check that your `CIRCLE_APP_ID` is correct
- Verify backend is running on port 3001
- Check browser console for detailed errors

### "Failed to create user"

- Verify `CIRCLE_API_KEY` is correct
- Check that API key has correct permissions
- Review backend logs for error details

### PIN Modal Not Showing

- Ensure Circle SDK is initialized
- Check that `userToken` and `encryptionKey` are set
- Verify challenge was created successfully

### CORS Errors

- Make sure backend is running
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Verify ports match (3001 for backend, 3000 for frontend)

## API Endpoints

Your backend now has these endpoints:

| Endpoint                         | Method | Description       |
| -------------------------------- | ------ | ----------------- |
| `/api/wallet/config`             | GET    | Get Circle App ID |
| `/api/wallet/user/create`        | POST   | Create new user   |
| `/api/wallet/wallet/create`      | POST   | Create wallet     |
| `/api/wallet/wallets`            | GET    | List wallets      |
| `/api/wallet/user/status`        | GET    | Get user status   |
| `/api/wallet/wallet/balance`     | POST   | Get balance       |
| `/api/wallet/transaction/create` | POST   | Send transaction  |

## Testing with cURL

```bash
# Test backend is running
curl http://localhost:3001/api/wallet/config

# Create a new user
curl -X POST http://localhost:3001/api/wallet/user/create \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Resources

- 📖 [Full Integration Guide](./CIRCLE_INTEGRATION.md)
- 🔗 [Circle Docs](https://developers.circle.com/wallets/user-controlled)
- 💻 [Circle Web SDK](https://github.com/circlefin/w3s-pw-web-sdk)
- 🎮 [Developer Console](https://console.circle.com/)

## Support

Need help?

- Review the detailed guide: `CIRCLE_INTEGRATION.md`
- Check Circle's [documentation](https://developers.circle.com/)
- Join the [Circle community](https://community.circle.com/)

---

**You're all set!** Start building your AI-powered DeFi investment platform on Circle Smart Wallets. 🚀
