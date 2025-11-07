import { FundStatus, FundType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export enum FundTypeEnum {
  MixedUse = 'MixedUse',
  Residential = 'Residential',
}
export enum FundStatusEnum {
  Active = 'Active',
  Closed = 'Closed',
}
export class CreateFundDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;
  @IsOptional()
  startDate?: string;
  @IsEnum(FundStatusEnum)
  @IsOptional()
  status?: FundStatus;
  @IsEnum(FundTypeEnum, { message: 'Type must be MixedUse or Residential' })
  @IsNotEmpty({ message: 'Type is required' })
  fundType: FundType;
}
