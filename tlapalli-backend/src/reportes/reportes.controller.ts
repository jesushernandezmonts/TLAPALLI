import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, ParseIntPipe, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import * as https from 'https';
import * as http from 'http';

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo', {
    storage: memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('tipo') tipo: string,
    @Body('nombre') nombre: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió el archivo');
    }
    const result = await this.cloudinaryService.uploadFile(file, 'reportes');
    return this.reportesService.create(tipo, nombre, result.secureUrl);
  }

  @Get('download/:id')
  async downloadReport(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const report = await this.reportesService.findOne(id);
    const url = report.url;
    const filename = `${report.nombre}.pdf`;

    const client = url.startsWith('https') ? https : http;
    client.get(url, (stream) => {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      stream.pipe(res);
    }).on('error', () => {
      res.status(500).json({ message: 'Error al descargar el archivo' });
    });
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
