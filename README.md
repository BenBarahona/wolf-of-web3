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
- **Backend API**: http://localhost:4000
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
PORT=4000
NODE_ENV=development
```

### Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
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
- **[QUICKSTART.md](./QUICKSTART.md)** - Detailed quickstart guide
- **[QUICKSTART_DATABASE.md](./QUICKSTART_DATABASE.md)** - Database setup
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database documentation
- **[CIRCLE_INTEGRATION.md](./CIRCLE_INTEGRATION.md)** - Circle wallet docs
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

## 🔑 Features

### ✅ Implemented

- User-controlled Circle wallets
- PIN-based authentication
- Smart Contract Accounts (SCA)
- Wallet creation flow
- User database with Circle mapping
- Activity tracking
- PostgreSQL + Redis + pgAdmin

### 🚧 Coming Soon

- User authentication (JWT/OAuth)
- AI trading strategies
- Multi-chain support
- Portfolio dashboard
- Transaction history
- DeFi integrations

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :5432  # PostgreSQL

# Stop local PostgreSQL if installed
brew services stop postgresql
```

### Database Connection Failed

```bash
# Check containers
yarn db:status

# View logs
yarn db:logs

# Restart
yarn db:restart

# Fresh start
yarn db:reset
```

### Module Not Found

```bash
# Reinstall dependencies
yarn install

# If pg module missing
cd backend && yarn add pg
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

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `yarn test`
4. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

- **Issues**: GitHub Issues
- **Docs**: See documentation links above
- **Circle Support**: [Circle Developer Console](https://console.circle.com/)

---

**Built with ❤️ using Circle, NestJS, and Next.js**
