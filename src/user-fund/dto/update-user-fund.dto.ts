import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserFundDto } from './create-user-fund.dto';
import { FundStatus } from '@prisma/client';

export class UpdateUserFundDto extends PartialType(CreateUserFundDto) {
  @IsEnum(FundStatus, { message: 'status must be either Active or Closed' })
  @IsOptional()
  status?: FundStatus;
}
