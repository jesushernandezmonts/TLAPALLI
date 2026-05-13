import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean } from 'class-validator';

export class CreateInstructorDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsNumber()
  tallerId?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
