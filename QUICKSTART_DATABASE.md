# 🚀 Quick Start - Database Setup

Get your database running in 2 minutes!

## Easiest Way (Recommended)

```bash
# From project root
yarn db:start
```

That's it! This command will:

- ✅ Start PostgreSQL, Redis, and pgAdmin with Docker
- ✅ Install the PostgreSQL driver
- ✅ Create the database automatically

## Alternative: Manual Setup

### 1. Start Docker Services

```bash
docker-compose up -d
```

### 2. Install PostgreSQL Driver

```bash
cd backend
yarn add pg
```

### 3. Configure Environment

Add to `backend/.env`:

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wolf_user
DATABASE_PASSWORD=wolf_password
DATABASE_NAME=wolf_of_web3
```

### 4. Start Backend

```bash
cd backend
yarn dev
```

## What Gets Created

### Database Tables

The backend automatically creates:

1. **users** - User profiles with Circle userId mapping
2. **wallet_preferences** - Wallet nicknames and settings
3. **trading_strategies** - AI trading bot configurations
4. **user_activities** - Activity logs for analytics

### Services

| Service    | Access                                         | Credentials                          |
| ---------- | ---------------------------------------------- | ------------------------------------ |
| PostgreSQL | `localhost:5432`                               | `wolf_user` / `wolf_password`        |
| Redis      | `localhost:6379`                               | No auth                              |
| pgAdmin    | [http://localhost:5050](http://localhost:5050) | `admin@wolf-of-web3.local` / `admin` |

## API Changes

### Create User Endpoint

**Before:**

```json
POST /api/wallet/user/create
{}
```

**After:**

```json
POST /api/wallet/user/create
{
  "email": "user@example.com",
  "username": "wolftrader"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "circle-uuid",
    "userToken": "jwt-token",
    "encryptionKey": "key",
    "challengeId": "challenge-id",
    "dbUserId": "your-database-user-id"
  }
}
```

## Useful Commands

```bash
# View logs
yarn db:logs

# Stop services
yarn db:stop

# Restart services
yarn db:restart

# Check status
yarn db:status

# Connect to PostgreSQL
yarn db:psql

# Reset database (WARNING: Deletes all data!)
yarn db:reset

# View all available commands
yarn db:help
```

Or use Docker Compose directly:

```bash
docker-compose logs postgres
docker-compose stop
docker-compose restart
docker-compose down -v
```

## Troubleshooting

### Port 5432 already in use

```bash
# Find what's using the port
lsof -i :5432

# Stop local PostgreSQL (if installed)
brew services stop postgresql
```

### Containers won't start

```bash
# Check what's wrong
docker-compose logs

# Fresh start
docker-compose down -v
docker-compose up -d
```

### Backend can't connect

1. Check `.env` file has correct credentials
2. Verify containers are running: `docker-compose ps`
3. Check backend logs for specific errors

## Development Without Docker

If you can't use Docker, the backend works with SQLite automatically:

```env
# In backend/.env, either:
DATABASE_TYPE=sqlite
# Or just omit DATABASE_TYPE entirely
```

## Next Steps

1. ✅ Database is running
2. ✅ Backend can connect
3. 🎯 **Update your frontend to send email/username when creating users**
4. 🎯 **Test the wallet creation flow**
5. 🎯 **View users in pgAdmin**

## All Available Scripts

See [SCRIPTS.md](./SCRIPTS.md) for a complete list of all available commands including:

- Development commands (`yarn dev`, `yarn build`)
- Database management (`yarn db:*`)
- Testing and linting
- Production deployment

## See Also

- [SCRIPTS.md](./SCRIPTS.md) - Complete command reference
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed database documentation
- [CIRCLE_INTEGRATION.md](./CIRCLE_INTEGRATION.md) - Circle wallet integration
- [QUICKSTART.md](./QUICKSTART.md) - General quickstart guide
