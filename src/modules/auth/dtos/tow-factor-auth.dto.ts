import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class TwoFactorAuthDto {
  @ApiProperty({
    type: String,
  })
  @IsNumberString()
  @IsNotEmpty()
  twoFactorAuthenticationCode: string;
}
