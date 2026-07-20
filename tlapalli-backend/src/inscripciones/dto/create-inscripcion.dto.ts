import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInscripcionDto {
  @IsNumber()
  @Type(() => Number)
  alumnoId: number;

  @IsNumber()
  @Type(() => Number)
  tallerId: number;

  @IsOptional()
  @IsString()
  estatusPago?: string; // 'pendiente', 'al_corriente', 'deudor'

  @IsOptional()
  @IsString()
  periodo?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  anio?: number;
}
