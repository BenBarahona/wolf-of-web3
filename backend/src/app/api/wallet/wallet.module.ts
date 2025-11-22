import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CircleModule } from '../../../services/circle/circle.module';
import { UsersModule } from '../../../services/users/users.module';

@Module({
  imports: [CircleModule, UsersModule],
  controllers: [WalletController],
})
export class WalletModule {}

