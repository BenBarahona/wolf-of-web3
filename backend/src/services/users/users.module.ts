import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserPreferencesService } from './user-preferences.service';
import { User, WalletPreference, TradingStrategy, UserActivity, UserPreferences } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      WalletPreference,
      TradingStrategy,
      UserActivity,
      UserPreferences,
    ]),
  ],
  providers: [UsersService, UserPreferencesService],
  exports: [UsersService, UserPreferencesService, TypeOrmModule],
})
export class UsersModule {}

