# Onboarding Implementation

This document describes the new onboarding flow implementation for Wolf of Web3.

## Overview

The onboarding flow has been completely redesigned to provide a guided experience for new users. It includes:

1. **Splash screens** showcasing the Wolf character and value propositions
2. **Authentication** (Sign up / Login)
3. **Investment questionnaire** to understand user preferences
4. **Strategy selection** based on user inputs
5. **Wallet creation** (existing Circle integration)

## Flow Diagram

```
Root (/)
  ↓
Onboarding Splash (/onboarding)
  ↓ (Sign Up or Log In)
  ├─→ Sign Up (/auth/signup)
  │     ↓
  │   Investment Preferences (/questionnaire/investment)
  │     ↓
  │   Time Horizon (/questionnaire/time-horizon)
  │     ↓
  │   Risk Preference (/questionnaire/risk)
  │     ↓
  │   Strategy Selection (/questionnaire/strategy)
  │     ↓
  │   Wallet Setup (/wallet-setup)
  │     ↓
  │   Dashboard (/dashboard)
  │
  └─→ Login (/auth/login)
        ↓
      Dashboard (/dashboard)
```

## Pages Created

### Frontend Pages

1. **`/app/onboarding/page.tsx`** - Carousel with 3 splash screens
   - Shows wolf character images and value propositions
   - Has Sign Up and Log In buttons

2. **`/app/auth/signup/page.tsx`** - Account creation form
   - Email (required) and Username (optional)
   - Progress bar showing step 1/4
   - Benefits list

3. **`/app/auth/login/page.tsx`** - Login form
   - Email input
   - Redirects to dashboard after successful login

4. **`/app/questionnaire/investment/page.tsx`** - Investment preferences
   - Multi-select grid of investment types
   - Options: Stablecoins, Meme Coins, RWAs, Bitcoin, ETH, AI Tokens, Yield Farming, Blue Chips
   - Progress bar showing step 2/4

5. **`/app/questionnaire/time-horizon/page.tsx`** - Time horizon selection
   - Single-select options
   - Options: Less than a day, Less than a week, Up to a month, More than a year
   - Progress bar showing step 3/4

6. **`/app/questionnaire/risk/page.tsx`** - Risk preference
   - Single-select options
   - Options: Low Risk, Medium Risk, High Risk
   - Progress bar showing step 4/4

7. **`/app/questionnaire/strategy/page.tsx`** - Strategy selection
   - Loading screen (3 seconds) showing "Let me think..."
   - Shows 4 strategy options based on user preferences
   - Options: Low-Risk Strategy, Balanced Strategy, High-Growth Strategy, Wolf Recommendation

8. **`/app/wallet-setup/page.tsx`** - Wraps existing WalletSetup component

### Backend Implementation

#### Entities

1. **`backend/src/entities/user-preferences.entity.ts`** - New entity
   - Stores investment preferences, time horizon, risk preference, selected strategy
   - Tracks onboarding completion status
   - Linked to User entity via `userId`

#### Services

1. **`backend/src/services/users/user-preferences.service.ts`** - Preferences service
   - `createOrUpdate()` - Create or update user preferences
   - `findByUserId()` - Get preferences by user ID
   - `completeOnboarding()` - Mark onboarding as completed
   - `hasCompletedOnboarding()` - Check if user completed onboarding

#### API Endpoints

1. **POST `/api/users/preferences`** - Save/update user preferences
   - Body: `{ investmentPreferences, timeHorizon, riskPreference, selectedStrategy }`
   - Requires `x-user-token` header

2. **GET `/api/users/preferences`** - Get user preferences
   - Requires `x-user-token` header

3. **PUT `/api/users/preferences/complete-onboarding`** - Mark onboarding complete
   - Requires `x-user-token` header

### Frontend Hooks

**`frontend/lib/circle/usePreferences.ts`** - React hook for preferences API

- `savePreferences()` - Save user preferences
- `getPreferences()` - Get user preferences
- `completeOnboarding()` - Mark onboarding as completed

## Required Images

You need to add the following pixel art images to the `frontend/public/images/` directory:

1. **`wolf-office.png`** - Wolf sitting at office desk with coffee (Onboarding screen 1)
2. **`wolf-trading.png`** - Wolf with multiple trading monitors (Onboarding screen 2)
3. **`wolf-safe.png`** - Wolf with safe and gold coins (Onboarding screen 3)
4. **`wolf-thinking.png`** - Wolf thinking (Loading screen between risk and strategy)

These images should be placed in:

```
frontend/public/images/
├── wolf-office.png
├── wolf-trading.png
├── wolf-safe.png
└── wolf-thinking.png
```

## Data Flow

### Session Storage (During Onboarding)

During the onboarding flow, user selections are temporarily stored in `sessionStorage`:

- `signupEmail` - User's email from signup
- `signupUsername` - User's username from signup
- `investmentPreferences` - JSON array of selected investment types
- `timeHorizon` - Selected time horizon
- `riskPreference` - Selected risk preference
- `selectedStrategy` - Selected strategy
- `onboardingPreferences` - Combined object of all preferences

### Backend Storage

After wallet creation, preferences are saved to the backend:

1. User completes questionnaire → data stored in sessionStorage
2. User creates wallet → wallet setup completes
3. On "Go to Dashboard" click:
   - Preferences are sent to backend via POST `/api/users/preferences`
   - Onboarding marked complete via PUT `/api/users/preferences/complete-onboarding`
   - sessionStorage is cleared
   - User redirected to dashboard

## Database Migration

The new `user_preferences` table will be automatically created by TypeORM when the backend starts. The schema includes:

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  investment_preferences JSONB,
  time_horizon VARCHAR(50),
  risk_preference VARCHAR(20),
  selected_strategy VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Styling

All screens follow the Figma design with:

- Background: `#F5F5F0` (light beige)
- Primary blue: `#4F46E5` (blue-600)
- White cards with rounded corners
- Progress bars showing user's position in the flow
- Consistent spacing and typography

## Testing the Flow

1. Start the backend: `cd backend && yarn start`
2. Start the frontend: `cd frontend && yarn dev`
3. Navigate to `http://localhost:3000`
4. You should see the onboarding splash screen
5. Click "Sign Up" to go through the full flow
6. Complete each questionnaire step
7. Create your wallet
8. Preferences will be saved when you click "Go to Dashboard"

## Future Enhancements

- Add validation for Circle user creation during signup
- Implement actual PIN verification during login
- Check if user has completed onboarding and skip questionnaire for returning users
- Add animations between screens
- Add ability for users to update preferences later from settings
- Show selected strategy details on dashboard

## Notes

- The login flow currently bypasses the questionnaire (assumes returning users)
- Preferences are only saved after wallet creation is complete
- If a user abandons the flow mid-way, their preferences in sessionStorage will be lost
- The wolf images are placeholders - replace with actual pixel art from Figma
