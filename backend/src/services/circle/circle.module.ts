import { Module } from '@nestjs/common';
import { CircleService } from './circle/circle.service';

@Module({
  providers: [CircleService]
})
export class CircleModule {}
