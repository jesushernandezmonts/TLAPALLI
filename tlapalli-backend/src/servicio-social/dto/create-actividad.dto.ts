import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class CreateActividadDto {
  @IsInt()
  servicioSocialId: number;

  @IsInt()
  @Min(1)
  horas: number;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  comentarios?: string;

  @IsOptional()
  @IsString()
  evidenciaUrl?: string;

  @IsOptional()
  @IsString()
  estatus?: string; // 'pendiente' | 'aprobada' (default aprobada for admin)
}
