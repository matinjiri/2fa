import { ApiProperty } from '@nestjs/swagger';

export class SuccessfulLoginResponseDto {
  @ApiProperty({ description: 'Generated access token for authenticate' })
  accessToken: string;

  @ApiProperty({
    description:
      'Indicates whether two-factor authentication is enabled for the user',
  })
  isTwoFactorAuthenticationEnabled: boolean;
}
