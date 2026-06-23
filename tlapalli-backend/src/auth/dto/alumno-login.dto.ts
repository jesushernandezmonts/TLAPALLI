import { IsEmail, IsString, MinLength } from 'class-validator';

export class AlumnoLoginDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string;
}
