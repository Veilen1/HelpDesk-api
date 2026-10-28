import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'cliente@ejemplo.com',
    description: 'Correo electrónico único para la cuenta',
  })
  @IsEmail({}, { message: 'El formato de correo no es válido' })
  email!: string;

  @ApiProperty({
    example: 'ContrasenaSegura123!',
    minLength: 6,
    description: 'Contraseña de la cuenta (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @ApiProperty({
    example: 'Carlos Cliente',
    minLength: 2,
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;
}
