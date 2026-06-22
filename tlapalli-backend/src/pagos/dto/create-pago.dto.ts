import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  alumnoId: number;

  @IsNumber()
  monto: number;

  @IsString()
  mesCorrespondiente: string;

  @IsOptional()
  @IsString()
  metodoPago?: string;
}
