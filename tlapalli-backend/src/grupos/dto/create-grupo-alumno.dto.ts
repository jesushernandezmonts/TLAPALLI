import { IsString } from 'class-validator';

export class CreateGrupoAlumnoDto {
  @IsString()
  nombre: string;

  @IsString()
  apellidoPaterno: string;

  @IsString()
  apellidoMaterno: string;

  @IsString()
  telefono: string;
}
