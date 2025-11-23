import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersModule as UsersServiceModule } from '../../../services/users/users.module';
import { CircleModule } from '../../../services/circle/circle.module';
import { TransactionsModule } from '../../../services/transactions/transactions.module';

@Module({
  imports: [UsersServiceModule, CircleModule, TransactionsModule],
  controllers: [UsersController],
})
export class UsersApiModule {}

