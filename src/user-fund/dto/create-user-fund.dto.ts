import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateUserFundDto {
  @IsNumber()
  @IsNotEmpty({ message: 'fundId is required' })
  fundId: number;
  @IsNumber()
  @IsNotEmpty({ message: 'userId is required' })
  userId: number;

  @IsNotEmpty({ message: 'investmentDate is required' })
  investmentDate: string;

  @IsNumber({}, { message: 'commitmentAmount must be a number' })
  @IsNotEmpty({ message: 'commitmentAmount is required' })
  @Min(0, { message: 'commitmentAmount must be greater than or equal to 0' })
  commitmentAmount: number;
}
