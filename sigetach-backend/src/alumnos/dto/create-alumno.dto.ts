import { IsString, IsOptional, IsDateString, Length } from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  nombre: string;

  @IsString()
  apellidoPaterno: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @IsString()
  @Length(18, 18, { message: 'CURP debe tener 18 caracteres' })
  curp: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  fotoUrl?: string;
}
