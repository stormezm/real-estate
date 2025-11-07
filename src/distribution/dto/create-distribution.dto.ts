import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateDistributionDto {
  @IsInt()
  @IsNotEmpty({ message: 'User Fund ID is required' })
  fundId: number;
  @IsInt()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;
  @IsNotEmpty({ message: 'distribution date is required' })
  distributionDate: string;

  @IsNotEmpty({ message: 'Amount Paid is required' })
  amountPaid: number;

  @IsString()
  @IsNotEmpty({ message: 'Payment Method is required' })
  paymentMethod: string;

  @IsString()
  @IsOptional()
  statementUrl?: string;
}
