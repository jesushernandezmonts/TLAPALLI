import { IsString, IsOptional, IsISO8601, IsIn } from 'class-validator';

export class CreateActividadDto {
  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsISO8601()
  fecha: string;

  @IsString()
  @IsIn(['interna', 'externa'])
  tipo: string;

  @IsString()
  @IsIn(['galeria', 'audioteca', 'auditorio'])
  ubicacion: string;
}
