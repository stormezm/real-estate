import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  imports: [PrismaModule, JwtModule.register({})],
  providers: [UserService],
})
export class UserModule {}
