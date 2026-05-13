import { IsNumber, IsString, IsOptional, IsDecimal } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  alumnoId: number;

  @IsNumber()
  monto: number;

  @IsString()
  mesCorrespondiente: string;

  @IsString()
  @IsOptional()
  metodoPago?: string;
}
