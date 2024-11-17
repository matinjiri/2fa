import { ApiProperty } from '@nestjs/swagger';

export class Successful2faAuthResponseDto {
  @ApiProperty({ description: 'Main access token' })
  accessToken: string;
}
