// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentsModule } from './agents/agents.module';
import { CircleModule } from './services/circle/circle.module';
import { X402Module } from './services/x402/x402.module';
import { AgentModule } from './app/api/agent/agent.module';
import { StrategyModule } from './app/api/strategy/strategy.module';
import { X402TestModule } from './app/api/x402-test/x402-test.module';
import { PaymentsModule } from './app/api/payments/payments.module';
import { WalletModule } from './app/api/wallet/wallet.module';
import { UsersModule } from './services/users/users.module';
import { UsersApiModule } from './app/api/users/users.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const usePostgres = configService.get('DATABASE_TYPE') === 'postgres';

        if (usePostgres) {
          return {
            type: 'postgres' as const,
            host: configService.get<string>('DATABASE_HOST', 'localhost'),
            port: configService.get<number>('DATABASE_PORT', 5432),
            username: configService.get<string>('DATABASE_USER', 'wolf_user'),
            password: configService.get<string>('DATABASE_PASSWORD', 'wolf_password'),
            database: configService.get<string>('DATABASE_NAME', 'wolf_of_web3'),
            entities: [path.join(__dirname, 'entities/**/*.entity{.ts,.js}')],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
            autoLoadEntities: true,
          };
        } else {
          return {
            type: 'sqlite' as const,
            database: path.join(__dirname, '../db.sqlite'),
            entities: [path.join(__dirname, 'entities/**/*.entity{.ts,.js}')],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
            autoLoadEntities: true,
          };
        }
      },
    }),
    UsersModule,
    AgentsModule,
    CircleModule,
    X402Module,
    AgentModule,
    StrategyModule,
    X402TestModule,
    PaymentsModule,
    WalletModule,
    UsersApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
