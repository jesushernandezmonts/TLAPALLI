import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, ParseIntPipe, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as express from 'express';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload/:alumnoId')
  @UseInterceptors(FileInterceptor('archivo', {
    storage: diskStorage({
      destination: './uploads/documentos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  upload(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('tipo') tipo: string,
  ) {
    const url = `/uploads/documentos/${file.filename}`;
    return this.documentosService.upload(alumnoId, file.originalname, tipo, url);
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


  @Get('alumno/:alumnoId')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.documentosService.findByAlumno(alumnoId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.remove(id);
  }
}

