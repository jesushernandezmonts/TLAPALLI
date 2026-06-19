import { IsNumber, IsString } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  alumnoId: number;

  @IsNumber()
  monto: number;

  @IsString()
  mesCorrespondiente: string;
}
