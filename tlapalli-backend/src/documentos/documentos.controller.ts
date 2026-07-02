import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, ParseIntPipe, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';
import * as express from 'express';

@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload/:alumnoId')
  @UseInterceptors(FileInterceptor('archivo', {
    storage: memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }))
  async upload(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('tipo') tipo: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió el archivo');
    }
    const result = await this.cloudinaryService.uploadFile(file, 'documentos');
    return this.documentosService.upload(alumnoId, file.originalname, tipo, result.secureUrl);
  }

  @Post('scan')
  async scan(
    @Body('dialog') dialog: boolean = false,
    @Res() res: express.Response,
  ) {
    const pdfBuffer = await this.documentosService.scanDocument(dialog);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=documento_escaneado.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }


  @Get('all-grouped')
  findAllGrouped() {
    return this.documentosService.findAllGrouped();
  }

  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.documentosService.findByAlumno(alumnoId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.remove(id);
  }
}

