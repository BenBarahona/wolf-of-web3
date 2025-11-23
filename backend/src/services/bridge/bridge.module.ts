import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BridgeService } from './bridge.service';

@Module({
  imports: [ConfigModule],
  providers: [BridgeService],
  exports: [BridgeService],
})
export class BridgeModule {}

