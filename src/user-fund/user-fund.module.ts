import { Module } from '@nestjs/common';
import { UserFundService } from './user-fund.service';
import { UserFundController } from './user-fund.controller';
import { CalculateService } from './calculate.service';

@Module({
  controllers: [UserFundController],
  providers: [UserFundService, CalculateService],
})
export class UserFundModule {}
