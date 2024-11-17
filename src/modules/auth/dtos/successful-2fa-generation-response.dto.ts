import { ApiProperty } from '@nestjs/swagger';

export class Successful2faGenerationResponseDto {
  @ApiProperty({ description: ' Generateed qr code data url' })
  data: string;
}
