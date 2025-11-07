import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminAuthService } from './adminAuth.service';
import { AuthController } from './auth.controller';
import { AdminAuthController } from './adminAuth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAdminStrategy } from './strategy/jwt-admin.strategy';
import { JwtStrategy } from './strategy/jwt.strtegy';

@Module({
  providers: [AuthService, AdminAuthService, JwtAdminStrategy, JwtStrategy],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, AdminAuthController],
})
export class AuthModule {}
