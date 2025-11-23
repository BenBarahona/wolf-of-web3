# Environment Variables Reference

This document lists all required environment variables for the Wolf of Web3 platform.

## Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```bash
# Circle Configuration
NEXT_PUBLIC_CIRCLE_APP_ID=your_circle_app_id_here

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Contract Addresses (Arc L2 Testnet)
NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS=0x0000000000000000000000000000000000000000
```

### Variable Descriptions

#### `NEXT_PUBLIC_CIRCLE_APP_ID`

- **Required:** Yes
- **Description:** Your Circle Programmable Wallets App ID
- **Where to get it:** [Circle Developer Console](https://console.circle.com/)
- **Example:** `01234567-89ab-cdef-0123-456789abcdef`

#### `NEXT_PUBLIC_API_URL`

- **Required:** Yes
- **Description:** URL of your backend API
- **Development:** `http://localhost:3001`
- **Production:** Your deployed backend URL (e.g., `https://api.yourapp.com`)

#### `NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS`

- **Required:** Yes (after deployment)
- **Description:** Address of the deployed LowRiskLendingVault contract on Arc L2
- **Where to get it:** After deploying contracts with Foundry
- **Example:** `0x1234567890abcdef1234567890abcdef12345678`
- **Default:** `0x0000000000000000000000000000000000000000` (placeholder)

---

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```bash
# Circle API Credentials
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_APP_ID=your_circle_app_id_here
CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/wolf_of_web3

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Variable Descriptions

#### `CIRCLE_API_KEY`

- **Required:** Yes
- **Description:** Your Circle API key for server-side operations
- **Where to get it:** [Circle Developer Console](https://console.circle.com/) → API Keys
- **Security:** Keep this secret! Never commit to git or expose in frontend

#### `CIRCLE_APP_ID`

- **Required:** Yes
- **Description:** Your Circle Programmable Wallets App ID (same as frontend)
- **Where to get it:** [Circle Developer Console](https://console.circle.com/)

#### `CIRCLE_ENTITY_SECRET`

- **Required:** Yes
- **Description:** Your Circle entity secret for wallet operations
- **Where to get it:** [Circle Developer Console](https://console.circle.com/) → Entity Secret
- **Security:** Keep this secret! Never commit to git

#### `DATABASE_URL`

- **Required:** Yes (if using database)
- **Description:** Connection string for your database
- **Example:** `postgresql://user:password@localhost:5432/wolf_of_web3`

#### `PORT`

- **Required:** No
- **Description:** Port for the backend server
- **Default:** `3001`

#### `NODE_ENV`

- **Required:** No
- **Description:** Environment mode
- **Values:** `development`, `production`, `test`
- **Default:** `development`

---

## Getting Circle Credentials

### Step 1: Create a Circle Account

1. Go to [Circle Developer Console](https://console.circle.com/)
2. Sign up or log in
3. Create a new project

### Step 2: Get Your App ID

1. In the Circle Console, navigate to your project
2. Go to **Programmable Wallets** section
3. Copy your **App ID**
4. Add to both frontend and backend `.env` files

### Step 3: Get Your API Key

1. In the Circle Console, go to **API Keys**
2. Click **Create API Key**
3. Copy the API key (you'll only see it once!)
4. Add to backend `.env` file

### Step 4: Get Your Entity Secret

1. In the Circle Console, go to **Entity Secret**
2. If you haven't created one, follow the setup wizard
3. Copy your entity secret
4. Add to backend `.env` file

---

## Deploying Contracts & Getting Vault Address

### Step 1: Deploy to Arc L2 Testnet

```bash
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://rpc.testnet.arc.network \
  --broadcast \
  --verify
```

### Step 2: Copy the Deployed Address

After deployment, Foundry will output:

```
== Logs ==
LowRiskLendingVault deployed at: 0x1234...5678
```

### Step 3: Update Environment Variable

Add the deployed address to `frontend/.env.local`:

```bash
NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

---

## Security Best Practices

### ✅ DO:

- Use `.env.local` for frontend (Next.js convention)
- Use `.env` for backend
- Add `.env` and `.env.local` to `.gitignore`
- Use different credentials for development and production
- Rotate API keys periodically

### ❌ DON'T:

- Commit `.env` or `.env.local` files to git
- Expose backend credentials in frontend
- Share API keys or entity secrets
- Use production credentials in development

---

## Checking Your Configuration

### Frontend

```bash
cd frontend
yarn dev
# Check browser console for any missing env var warnings
```

### Backend

```bash
cd backend
yarn start:dev
# Check terminal for any missing env var errors
```

---

## Example Files

### `frontend/.env.local.example`

```bash
NEXT_PUBLIC_CIRCLE_APP_ID=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS=
```

### `backend/.env.example`

```bash
CIRCLE_API_KEY=
CIRCLE_APP_ID=
CIRCLE_ENTITY_SECRET=
DATABASE_URL=
PORT=3001
NODE_ENV=development
```

Copy these example files and fill in your actual values:

```bash
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

---

## Troubleshooting

### "Circle SDK not initialized"

- Check `NEXT_PUBLIC_CIRCLE_APP_ID` is set correctly in `frontend/.env.local`
- Verify the value matches your Circle Console App ID

### "Unauthorized" or "Invalid API Key"

- Check `CIRCLE_API_KEY` in `backend/.env`
- Ensure it's the correct key from Circle Console
- Verify the key hasn't been revoked

### "Contract not found"

- Check `NEXT_PUBLIC_LOW_RISK_VAULT_ADDRESS` is set
- Verify the contract is deployed to Arc L2 testnet
- Confirm the address is correct (copy from deployment logs)

### Environment variables not loading

- Restart your dev server after changing `.env` files
- For Next.js: Variables must start with `NEXT_PUBLIC_` to be available in browser
- For NestJS: Make sure `@nestjs/config` is properly set up
