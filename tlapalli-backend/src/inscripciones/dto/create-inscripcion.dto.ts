import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInscripcionDto {
  @IsNumber()
  alumnoId: number;

  @IsNumber()
  tallerId: number;

  @IsOptional()
  @IsString()
  estatusPago?: string; // 'pendiente', 'al_corriente', 'deudor'

  @IsOptional()
  @IsString()
  periodo?: string;

  @IsOptional()
  @IsNumber()
  anio?: number;
}
