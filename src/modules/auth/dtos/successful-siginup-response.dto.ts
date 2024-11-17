import { ApiProperty } from '@nestjs/swagger';

export class SuccessfulSignupResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'The email of the registered user' })
  email: string;

  @ApiProperty({ description: 'The username of the registered user' })
  username: string;
}
