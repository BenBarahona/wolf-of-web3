import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CircleService } from './circle/circle.service';

@Module({
  imports: [ConfigModule],
  providers: [CircleService],
  exports: [CircleService],
})
export class CircleModule {}
