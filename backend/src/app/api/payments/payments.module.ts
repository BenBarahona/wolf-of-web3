// payments.module.ts

import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { X402Module } from '../../../services/x402/x402.module';

@Module({
  imports: [X402Module],
  controllers: [PaymentsController],
})
export class PaymentsModule {}

