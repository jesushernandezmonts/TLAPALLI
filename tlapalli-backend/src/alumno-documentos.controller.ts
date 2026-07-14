import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AlumnoJwtAuthGuard } from './auth/strategies/alumno-jwt-auth.guard';
import { AlumnoDocumentosService } from './alumno-documentos.service';

@Controller('alumno-documentos')
@UseGuards(AlumnoJwtAuthGuard)
export class AlumnoDocumentosController {
  constructor(private readonly alumnoDocumentosService: AlumnoDocumentosService) {}

  @Get('me')
  getMisDocumentos(@Req() req) {
    return this.alumnoDocumentosService.getMisDocumentos(req.user.id);
  }

  @Post('me/curp')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadCurp(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' }), new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.alumnoDocumentosService.uploadCurp(req.user.id, file);
  }

  @Post('me/domicilio')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadDomicilio(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' }), new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.alumnoDocumentosService.uploadDomicilio(req.user.id, file);
  }

  @Post('me/foto-infantil')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadFotoInfantil(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' }), new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.alumnoDocumentosService.uploadFotoInfantil(req.user.id, file);
  }
}
