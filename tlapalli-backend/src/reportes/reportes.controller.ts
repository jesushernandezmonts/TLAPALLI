import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/reportes';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'reporte-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('tipo') tipo: string,
    @Body('nombre') nombre: string,
  ) {
    const url = `/uploads/reportes/${file.filename}`;
    return this.reportesService.create(tipo, nombre, url);
  }

  @Get()
  findAll() {
    return this.reportesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.remove(id);
  }
}
