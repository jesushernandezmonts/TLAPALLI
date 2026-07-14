import { Test, TestingModule } from '@nestjs/testing';
import { AlumnoDocumentosService } from './alumno-documentos.service';

describe('AlumnoDocumentosService', () => {
  let service: AlumnoDocumentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlumnoDocumentosService],
    }).compile();

    service = module.get<AlumnoDocumentosService>(AlumnoDocumentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
