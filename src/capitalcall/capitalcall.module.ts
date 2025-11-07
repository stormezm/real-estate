import { Module } from '@nestjs/common';
import { CapitalcallService } from './capitalcall.service';
import { CapitalcallController } from './capitalcall.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CapitalcallController],
  providers: [CapitalcallService],
})
export class CapitalcallModule {}
