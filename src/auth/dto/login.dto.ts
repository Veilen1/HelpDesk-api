import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'cliente@ejemplo.com',
    description: 'Correo electrónico registrado',
  })
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  email!: string;

  @ApiProperty({
    example: 'ContrasenaSegura123!',
    minLength: 6,
    description: 'Contraseña de la cuenta',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
