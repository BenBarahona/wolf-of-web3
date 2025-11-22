import { Module } from '@nestjs/common';
import { X402TestController } from './x402-test.controller';

@Module({
  controllers: [X402TestController]
})
export class X402TestModule {}
