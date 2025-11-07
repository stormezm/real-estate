import { IsNotEmpty, IsString, IsEmail, Matches } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'username is required' })
  @Matches(/^[a-z0-9]+$/, {
    message: 'username must be alphanumeric',
  })
  username: string;

  @IsEmail()
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  password: string;
  @IsString()
  @IsNotEmpty({ message: 'confirm password is required' })
  @Match('password', { message: 'passwords do not match' })
  confirmPassword: string;
}
