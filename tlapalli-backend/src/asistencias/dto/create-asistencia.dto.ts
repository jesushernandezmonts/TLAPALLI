import { IsString, IsOptional, IsDateString, IsArray, ValidateNested, IsInt, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AlumnoAsistenciaDto {
  @IsInt()
  grupoAlumnoId: number;

  @IsString()
  @IsIn(['asistencia', 'falta', 'justificada'])
  estado: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  comprobanteUrl?: string;
}

export class CreateAsistenciasDto {
  @IsInt()
  grupoId: number;

  @IsDateString()
  fecha: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlumnoAsistenciaDto)
  asistencias: AlumnoAsistenciaDto[];
}

export class AsistenciaQueryDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;
}
