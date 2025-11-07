import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export enum CapitalCallStatusEnum {
  Pending = 'Pending',
  Paid = 'Paid',
  LatePayment = 'Late Payment',
}

export class CreateCapitalCallDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
  @IsNumber()
  @IsNotEmpty()
  fundId: number;
  @IsNumber()
  @IsNotEmpty()
  amountCalled: number;

  @IsNotEmpty()
  callDate: string;

  @IsOptional()
  dueDate?: string;

  @IsEnum(CapitalCallStatusEnum)
  @IsOptional()
  status?: CapitalCallStatusEnum;
}
