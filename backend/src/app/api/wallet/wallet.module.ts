import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CircleModule } from '../../../services/circle/circle.module';

@Module({
  imports: [CircleModule],
  controllers: [WalletController],
})
export class WalletModule {}

