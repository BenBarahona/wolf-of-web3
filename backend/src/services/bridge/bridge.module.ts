import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BridgeService } from './bridge.service';
import { CCTPV2Service } from './cctp-v2.service';
import { GatewayService } from './gateway.service';

@Module({
  imports: [ConfigModule],
  providers: [BridgeService, CCTPV2Service, GatewayService],
  exports: [BridgeService, CCTPV2Service, GatewayService],
})
export class BridgeModule {}

