import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

const usePostgres = process.env.DATABASE_TYPE === 'postgres';

export const AppDataSource = new DataSource({
  type: usePostgres ? 'postgres' : 'sqlite',
  ...(usePostgres
    ? {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER || 'wolf_user',
        password: process.env.DATABASE_PASSWORD || 'wolf_password',
        database: process.env.DATABASE_NAME || 'wolf_of_web3',
      }
    : {
        database: path.join(__dirname, '../../db.sqlite'),
      }),
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '../entities/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/**/*{.ts,.js}')],
  subscribers: [],
});

