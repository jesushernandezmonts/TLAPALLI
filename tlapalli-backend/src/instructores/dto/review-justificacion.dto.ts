import { IsString, IsIn, IsOptional } from 'class-validator';

export class ReviewJustificacionDto {
  @IsIn(['aprobada', 'rechazada'], { message: 'El estatus debe ser "aprobada" o "rechazada"' })
  estatus: string;

  @IsOptional()
  @IsString()
  observacionesAdmin?: string;
}
