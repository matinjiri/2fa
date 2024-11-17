import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminService } from '../admin/admin.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Jwt2faStrategy } from './strategies/jwt-2fa.strategy';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    AdminModule,
  ],
  providers: [
    AuthService,
    AdminService,
    LocalStrategy,
    JwtStrategy,
    Jwt2faStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
