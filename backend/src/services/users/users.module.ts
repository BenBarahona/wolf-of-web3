import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, WalletPreference, TradingStrategy, UserActivity } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      WalletPreference,
      TradingStrategy,
      UserActivity,
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}

