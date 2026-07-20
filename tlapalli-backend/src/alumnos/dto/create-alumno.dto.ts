import { IsString, IsOptional, IsDateString, Length, IsBoolean, IsEmail, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAlumnoDto {
  @IsString()
  nombre: string;

  @IsString()
  apellidoPaterno: string;

  @IsOptional()
  @IsString()
  apellidoMaterno?: string;

  @IsOptional()
  @IsString()
  @Length(18, 18, { message: 'CURP debe tener 18 caracteres' })
  curp?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @IsOptional()
  @IsString()
  padecimientos?: string;

  @IsOptional()
  @IsBoolean()
  estatusActivo?: boolean;

  @IsOptional()
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email?: string;

  @IsOptional()
  @IsString()
  periodo?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  anio?: number;
}

