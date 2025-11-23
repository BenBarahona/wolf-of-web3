import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CircleModule } from '../../../services/circle/circle.module';
import { UsersModule } from '../../../services/users/users.module';
import { TransactionsModule } from '../../../services/transactions/transactions.module';

@Module({
  imports: [CircleModule, UsersModule, TransactionsModule],
  controllers: [WalletController],
})
export class WalletModule {}

