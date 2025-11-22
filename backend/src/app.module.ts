// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      synchronize: true,
      migrationsRun: false,
      logging: ['error', 'warn'],
    }),
    AgentsModule,
    CircleModule,
    X402Module,
    AgentModule,
    StrategyModule,
    X402TestModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
