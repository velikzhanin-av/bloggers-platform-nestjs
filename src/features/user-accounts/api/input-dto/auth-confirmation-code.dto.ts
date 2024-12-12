import { IsNotEmpty, IsString } from 'class-validator';

export class AuthConfirmationCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
