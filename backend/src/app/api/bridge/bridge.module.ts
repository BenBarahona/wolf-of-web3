import { Module } from '@nestjs/common';
import { BridgeController } from './bridge.controller';
import { BridgeModule as BridgeServiceModule } from '../../../services/bridge/bridge.module';

@Module({
  imports: [BridgeServiceModule],
  controllers: [BridgeController],
})
export class BridgeApiModule {}

