import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TicketStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    enum: TicketStatus,
    enumName: 'TicketStatus',
    example: TicketStatus.IN_PROGRESS,
    description:
      'Estado destino del ticket: OPEN, IN_PROGRESS, RESOLVED, o CLOSED',
  })
  @IsEnum(TicketStatus, { message: 'El estado proporcionado no es válido' })
  status!: TicketStatus;
}
