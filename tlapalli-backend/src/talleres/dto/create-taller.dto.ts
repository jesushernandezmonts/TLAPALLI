import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreateTallerDto {
  @IsString()
  nombreTaller: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  costoMensual: number;

  @IsNumber()
  @Min(1)
  cupoMaximo: number;

  @IsOptional()
  @IsString()
  horarioDescripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
