import { IsInt } from 'class-validator';

export class CreateGrupoAlumnoDto {
  @IsInt()
  alumnoId: number;
}
