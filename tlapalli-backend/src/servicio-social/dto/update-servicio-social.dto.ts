import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class UpdateServicioSocialDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  horasRequeridas?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  horasCompletadas?: number;

  @IsOptional()
  @IsString()
  estatus?: string; // en_curso, completado, suspendido, baja

  @IsOptional()
  @IsString()
  institucion?: string;

  @IsOptional()
  @IsString()
  programa?: string;

  @IsOptional()
  @IsString()
  supervisor?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
