# Database Setup Guide

## Quick Start with Docker

### 1. Start the Database

```bash
# Recommended script (does everything + validations)
yarn db:start

# using docker directly
docker-compose up -d

# Check if containers are running
yarn db:status
# or: docker-compose ps
```

### 2. Configure Environment Variables

Add these variables to your `backend/.env` file:

```env
# Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=wolf_user
DATABASE_PASSWORD=wolf_password
DATABASE_NAME=wolf_of_web3
```

### 3. Install PostgreSQL Driver

```bash
cd backend
yarn add pg
```

### 4. Start the Backend

```bash
cd backend
yarn dev
```

The backend will automatically:

- Connect to PostgreSQL
- Create all tables
- Synchronize the schema

## Services

| Service    | URL                     | Credentials                          |
| ---------- | ----------------------- | ------------------------------------ |
| PostgreSQL | `localhost:5432`        | `wolf_user` / `wolf_password`        |
| Redis      | `localhost:6379`        | No auth                              |
| pgAdmin    | `http://localhost:5050` | `admin@wolf-of-web3.local` / `admin` |

## Database Schema

### Users Table

Stores user profiles and Circle userId mapping:

- `id` - Internal user ID (UUID)
- `email` - User email (optional)
- `username` - Username (optional)
- `circle_user_id` - Circle's userId (required, unique)
- `status` - Account status
- `preferences` - JSONB for user settings
- `created_at`, `updated_at`, `last_login`

### Wallet Preferences Table

Stores user-specific wallet settings:

- `id` - Preference ID
- `user_id` - References users table
- `wallet_id` - Circle's wallet ID
- `nickname` - User-friendly wallet name
- `is_primary` - Primary wallet flag
- `hidden` - Hide from UI
- `metadata` - Additional settings

### Trading Strategies Table

Stores AI trading strategy configurations:

- `id` - Strategy ID
- `user_id` - References users table
- `wallet_id` - Circle's wallet ID
- `strategy_name` - Strategy name
- `strategy_type` - Type (dca, arbitrage, etc.)
- `strategy_config` - JSONB configuration
- `is_active` - Active status
- `risk_level` - Low/Medium/High
- `total_invested`, `current_value`
- `last_executed_at`

### User Activities Table

Logs user actions for analytics:

- `id` - Activity ID
- `user_id` - References users table
- `action_type` - Action name
- `metadata` - Additional data (JSONB)
- `ip_address`, `user_agent`
- `created_at`

## Development without Docker

If you prefer to develop without Docker, the backend will automatically use SQLite:

```env
# Use SQLite (default)
DATABASE_TYPE=sqlite
# Or omit DATABASE_TYPE entirely
```

The SQLite database file will be created at `backend/db.sqlite`.

## Managing the Database

### Using pgAdmin

1. Open http://localhost:5050
2. Login with `admin@wolf-of-web3.local` / `admin`
3. Add Server:
   - Host: `postgres` (or `host.docker.internal` on Mac/Windows)
   - Port: `5432`
   - Database: `wolf_of_web3`
   - Username: `wolf_user`
   - Password: `wolf_password`

### Using Terminal

```bash
# Connect to PostgreSQL
docker exec -it wolf-of-web3-db psql -U wolf_user -d wolf_of_web3

# List tables
\dt

# View users
SELECT * FROM users;

# Exit
\q
```

### Stop Services

```bash
# Using yarn
yarn db:stop          # Stop containers (keeps data)
yarn db:reset         # Stop and remove everything (WARNING: Deletes all data!)

# Or using Docker Compose directly
docker-compose stop
docker-compose down
docker-compose down -v  # WARNING: Deletes all data
```

### View Logs

```bash
# Using yarn
yarn db:logs          # PostgreSQL logs
yarn db:logs:all      # All service logs

# Or using Docker Compose
docker-compose logs postgres
docker-compose logs -f  # Follow mode
```

## Production Considerations

1. **Change Default Passwords**

   - Update database credentials in `docker-compose.yml`
   - Update pgAdmin password

2. **Use Migrations**

   - Set `synchronize: false` in production
   - Use TypeORM migrations: `yarn typeorm migration:generate`

3. **Environment Variables**

   - Never commit `.env` files
   - Use secrets management (AWS Secrets Manager, etc.)

4. **Backups**

   - Set up automated PostgreSQL backups
   - Store backups in S3 or similar

5. **Connection Pooling**
   - Configure TypeORM connection pool size
   - Monitor database connections

## Troubleshooting

### Container won't start

```bash
# Check logs
yarn db:logs

# Restart with fresh volumes
yarn db:reset
```

### Can't connect from backend

```bash
# Check if port is available
lsof -i :5432

# Check container health
yarn db:status
```

### Tables not created

- Check backend logs for TypeORM errors
- Verify `synchronize: true` in development
- Check database credentials

## Complete Command Reference

See [SCRIPTS.md](./SCRIPTS.md) for all available commands including:

- `yarn db:start` - Start database
- `yarn db:stop` - Stop database
- `yarn db:restart` - Restart services
- `yarn db:logs` - View logs
- `yarn db:psql` - Connect to PostgreSQL
- `yarn db:reset` - Reset database (deletes data!)
- And more...

## API Changes

The `POST /api/wallet/user/create` endpoint now:

- Creates user in Circle
- Stores mapping in database
- Returns both `circleUserId` and `dbUserId`

Example request:

```json
{
  "email": "user@example.com",
  "username": "wolftrader"
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "userId": "circle-uuid-here",
    "userToken": "jwt-token-here",
    "encryptionKey": "encryption-key-here",
    "challengeId": "challenge-id-here",
    "dbUserId": "database-uuid-here"
  }
}
```
