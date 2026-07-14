import { Test, TestingModule } from '@nestjs/testing';
import { AlumnoDocumentosController } from './alumno-documentos.controller';

describe('AlumnoDocumentosController', () => {
  let controller: AlumnoDocumentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlumnoDocumentosController],
    }).compile();

    controller = module.get<AlumnoDocumentosController>(AlumnoDocumentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
