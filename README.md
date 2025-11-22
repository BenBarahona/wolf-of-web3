# 🐺 Wolf of Web3

AI-powered crypto trading platform with Circle wallet integration.

## 🚀 Quick Start

```bash
# 1. Install dependencies
yarn install

# 2. Start database
yarn db:start

# 3. Configure environment (see below)

# 4. Start everything
yarn dev
```

Open:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:5050

## 📋 Prerequisites

- Node.js 18+
- Yarn 1.22+
- Docker & Docker Compose
- Circle API credentials

## ⚙️ Configuration

### Backend Environment

Create `backend/.env`:

```env
# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wolf_user
DATABASE_PASSWORD=wolf_password
DATABASE_NAME=wolf_of_web3

# Circle
CIRCLE_API_KEY=your_api_key
CIRCLE_APP_ID=your_app_id
CIRCLE_ENTITY_SECRET=your_entity_secret

# Server
PORT=3001
NODE_ENV=development
```

### Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CIRCLE_APP_ID=your_circle_app_id

# Optional: Enable social login
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🎯 Available Commands

### Development

```bash
yarn dev              # Start both frontend and backend
yarn dev:backend      # Backend only
yarn dev:frontend     # Frontend only
```

### Database

```bash
yarn db:start         # Start PostgreSQL, Redis, pgAdmin
yarn db:stop          # Stop database services
yarn db:restart       # Restart services
yarn db:logs          # View logs
yarn db:psql          # Connect to database
yarn db:status        # Check status
yarn db:reset         # Reset database (deletes data!)
```

### Build

```bash
yarn build            # Build both projects
yarn build:backend    # Backend only
yarn build:frontend   # Frontend only
```

See [SCRIPTS.md](./SCRIPTS.md) for complete command reference.

## 📚 Documentation

- **[SCRIPTS.md](./SCRIPTS.md)** - Complete command reference
- **[QUICKSTART.md](./QUICKSTART.md)** - Circle wallet quickstart
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup & reference
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture

## 🏗️ Project Structure

```
wolf-of-web3/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── entities/    # Database models
│   │   ├── services/    # Business logic
│   │   │   ├── circle/  # Circle API integration
│   │   │   └── users/   # User management
│   │   └── app/api/     # REST endpoints
│   └── database/        # Database migrations
├── frontend/            # Next.js app
│   ├── app/            # Pages
│   ├── components/     # React components
│   └── lib/circle/     # Circle SDK integration
└── docker-compose.yml  # Database services
```

## 🛠️ Tech Stack

### Backend

- **NestJS** - Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching & queues
- **Circle API** - Wallet infrastructure

### Frontend

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Circle Web SDK** - Wallet UI

### DevOps

- **Docker Compose** - Local development
- **pgAdmin** - Database management

## 📊 Database Schema

- **users** - User profiles with Circle userId mapping
- **wallet_preferences** - Wallet nicknames and settings
- **trading_strategies** - AI strategy configurations
- **user_activities** - Activity logs and analytics

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for details.

## 📄 License
