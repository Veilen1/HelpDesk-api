import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Hemos revisado la incidencia y ya está solucionada.',
    description: 'Texto del comentario',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'El comentario debe tener al menos 2 caracteres' })
  content!: string;
}
