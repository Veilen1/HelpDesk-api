import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
    description: 'Nuevo estado del ticket',
  })
  @IsEnum(TicketStatus, { message: 'El estado proporcionado no es válido' })
  status!: TicketStatus;
}
