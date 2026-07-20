import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJustificacionDto {
  @IsDateString({}, { message: 'La fecha de falta debe ser una fecha válida (YYYY-MM-DD)' })
  fechaFalta: string;

  @IsString({ message: 'El motivo es requerido' })
  motivo: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tallerId?: number;
}
