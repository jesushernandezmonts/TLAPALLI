import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportesService } from './reportes.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';

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

  @Get()
  findAll() {
    return this.reportesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportesService.remove(id);
  }
}
