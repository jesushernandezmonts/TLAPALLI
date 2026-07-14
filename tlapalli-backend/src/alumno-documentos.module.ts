import { Module } from '@nestjs/common';
import { AlumnoDocumentosController } from './alumno-documentos.controller';
import { AlumnoDocumentosService } from './alumno-documentos.service';

@Module({
  controllers: [AlumnoDocumentosController],
  providers: [AlumnoDocumentosService]
})
export class AlumnoDocumentosModule {}
