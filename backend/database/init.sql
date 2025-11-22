CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE strategy_status AS ENUM ('active', 'paused', 'stopped');

GRANT ALL PRIVILEGES ON DATABASE wolf_of_web3 TO wolf_user;
