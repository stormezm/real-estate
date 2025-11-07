import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be a valid email' })
  email: string;
  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}
