import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { InstructoresService } from './instructores.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';

@Controller('instructores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class InstructoresController {
  constructor(private readonly instructoresService: InstructoresService) {}

  @Post()
  create(@Body() dto: CreateInstructorDto) {
    return this.instructoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.instructoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInstructorDto) {
    return this.instructoresService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.remove(id);
  }

  @Patch(':id/toggle-activo')
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.toggleActivo(id);
  }

  @Post(':id/reenviar-activacion')
  reenviarActivacion(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.reenviarActivacion(id);
  }

  @Post(':id/upload-cv')
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/instructores/cv';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  uploadCv(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = `/uploads/instructores/cv/${file.filename}`;
    return this.instructoresService.updateCvUrl(id, url);
  }

  @Post(':id/upload-temario')
  @UseInterceptors(FileInterceptor('temario', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/instructores/temario';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  uploadTemario(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = `/uploads/instructores/temario/${file.filename}`;
    return this.instructoresService.updateTemarioUrl(id, url);
  }

  @Delete(':id/cv')
  removeCv(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.removeCv(id);
  }

  @Delete(':id/temario')
  removeTemario(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.removeTemario(id);
  }
}
