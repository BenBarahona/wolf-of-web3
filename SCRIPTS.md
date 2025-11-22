# 🚀 Available Scripts

Quick reference for all npm/yarn scripts in the project.

## Root Level Commands

Run from the project root directory:

```bash
# Development
yarn dev              # Start both backend and frontend
yarn dev:backend      # Start backend only
yarn dev:frontend     # Start frontend only

# Build
yarn build            # Build both backend and frontend
yarn build:backend    # Build backend only
yarn build:frontend   # Build frontend only

# Setup
yarn setup            # Install dependencies and start database
yarn clean            # Clean node_modules and build artifacts

# Database Management
yarn db:start         # Start PostgreSQL, Redis, and pgAdmin
yarn db:stop          # Stop all database services
yarn db:restart       # Restart database services
yarn db:logs          # View PostgreSQL logs (follow mode)
yarn db:logs:all      # View all service logs
yarn db:reset         # Reset database (WARNING: Deletes all data!)
yarn db:psql          # Connect to PostgreSQL CLI
yarn db:status        # Check database container status
```

## Backend Commands

Run from the `backend/` directory:

```bash
# Development
yarn dev              # Start in watch mode
yarn start            # Start without watch
yarn start:debug      # Start in debug mode

# Build & Production
yarn build            # Build for production
yarn start:prod       # Run production build

# Testing
yarn test             # Run tests
yarn test:watch       # Run tests in watch mode
yarn test:cov         # Run tests with coverage
yarn test:e2e         # Run end-to-end tests

# Code Quality
yarn lint             # Lint and fix TypeScript files
yarn format           # Format code with Prettier

# Database Management (same as root)
yarn db:start         # Start database
yarn db:stop          # Stop database
yarn db:restart       # Restart database
yarn db:logs          # View logs
yarn db:logs:all      # View all logs
yarn db:reset         # Reset database (deletes data!)
yarn db:psql          # Connect to PostgreSQL
yarn db:status        # Check status
```

## Frontend Commands

Run from the `frontend/` directory:

```bash
# Development
yarn dev              # Start Next.js dev server

# Build & Production
yarn build            # Build for production
yarn start            # Run production build

# Code Quality
yarn lint             # Run Next.js linter
```

## Quick Start Examples

### 🆕 First Time Setup

```bash
# From project root
yarn install          # Install all dependencies
yarn db:start         # Start database (installs pg driver)
yarn dev              # Start everything
```

Or use the one-liner:

```bash
yarn setup && yarn dev
```

### 🔄 Daily Development

```bash
# Terminal 1: Start everything
yarn dev

# Or separate terminals:
# Terminal 1: Backend
yarn dev:backend

# Terminal 2: Frontend
yarn dev:frontend
```

### 🗄️ Database Management

```bash
# Start database in the morning
yarn db:start

# Check if running
yarn db:status

# View logs if something's wrong
yarn db:logs

# Connect to database
yarn db:psql

# Stop at end of day
yarn db:stop

# Nuclear option (fresh start)
yarn db:reset
```

### 🏗️ Building for Production

```bash
# Build everything
yarn build

# Or individually
yarn build:backend
yarn build:frontend

# Run production
cd backend && yarn start:prod
cd frontend && yarn start
```

## Database Scripts Explained

### `yarn db:start`

- Starts PostgreSQL on port 5432
- Starts Redis on port 6379
- Starts pgAdmin on port 5050
- Installs `pg` driver if needed
- **Use this**: First time setup or after `db:stop`

### `yarn db:stop`

- Stops all containers but keeps data
- **Use this**: End of workday, keeping data

### `yarn db:restart`

- Restarts services without losing data
- **Use this**: If database is acting weird

### `yarn db:reset`

- ⚠️ **WARNING**: Deletes ALL database data
- Removes containers and volumes
- Creates fresh database
- **Use this**: When you want a clean slate

### `yarn db:logs`

- Shows PostgreSQL logs in real-time
- **Use this**: Debugging connection issues

### `yarn db:psql`

- Opens PostgreSQL CLI
- **Use this**: Running SQL queries directly

### `yarn db:status`

- Shows which containers are running
- **Use this**: Quick health check

## Environment Setup

Make sure you have:

1. **Backend** (`backend/.env`):

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wolf_user
DATABASE_PASSWORD=wolf_password
DATABASE_NAME=wolf_of_web3

CIRCLE_API_KEY=your_api_key
CIRCLE_APP_ID=your_app_id
CIRCLE_ENTITY_SECRET=your_entity_secret
```

2. **Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Troubleshooting

### "Port already in use"

```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :4000  # Backend
lsof -i :3000  # Frontend

# Stop local PostgreSQL if installed
brew services stop postgresql
```

### "Docker not running"

```bash
# Start Docker Desktop
open -a Docker

# Wait for Docker to start, then:
yarn db:start
```

### "Database connection failed"

```bash
# Check containers are running
yarn db:status

# View logs
yarn db:logs

# Try restart
yarn db:restart

# Last resort: fresh start
yarn db:reset
```

### "Module not found: pg"

```bash
cd backend
yarn add pg
```

## Tips

- 💡 Use `yarn dev` from root to start everything at once
- 💡 Use `yarn db:status` to quickly check if database is running
- 💡 Use `yarn db:logs` when debugging database issues
- 💡 Run `yarn db:reset` if you want to start fresh
- 💡 Keep pgAdmin open in browser for visual database management

## Related Documentation

- [QUICKSTART_DATABASE.md](./QUICKSTART_DATABASE.md) - Database setup guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed database docs
- [CIRCLE_INTEGRATION.md](./CIRCLE_INTEGRATION.md) - Circle wallet integration
- [QUICKSTART.md](./QUICKSTART.md) - General quickstart guide
