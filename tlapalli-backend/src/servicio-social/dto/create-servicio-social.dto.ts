import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class CreateServicioSocialDto {
  @IsInt()
  alumnoId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  horasRequeridas?: number;

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
