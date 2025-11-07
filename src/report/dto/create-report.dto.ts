// create-report.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty({ message: 'title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'type is required' })
  type: string;

  @IsNumber()
  @IsNotEmpty({ message: 'userId is required' })
  userId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'fundId is required' })
  fundId: number;
  @IsNotEmpty({ message: 'reportDate is required' })
  reportDate: string;

  @IsString()
  @IsNotEmpty({ message: 'body is required' })
  body: string;
}
