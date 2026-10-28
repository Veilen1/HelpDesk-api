import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTicketDto {
  @ApiProperty({
    example: 'b39bfdbf-2b7e-407f-8d2b-58a184138e60',
    description: 'ID del agente al que se asigna el ticket',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID del agente asignado es obligatorio' })
  assignedToId!: string;
}
