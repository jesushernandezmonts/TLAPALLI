import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { InstructoresService } from './instructores.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('instructores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstructoresController {
  constructor(
    private readonly instructoresService: InstructoresService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  @Roles('admin', 'profesor')
  async getMyProfile(@Request() req) {
    const instructorId = req.user.instructorId;
    const userId = req.user.id;

    if (instructorId) {
      return this.instructoresService.findOne(instructorId);
    }

    // Si es admin sin instructorId, devolver datos del usuario
    if (!userId) {
      return { usuario: req.user, esAdmin: true };
    }
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        creadoEn: true,
        fotoUrl: true,
      },
    });
    return { usuario, esAdmin: true };
  }

  @Patch('me')
  @Roles('admin', 'profesor')
  async updateMyProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.instructoresService.updateMyProfile(userId, dto);
  }

  @Post('me/upload-foto')
  @Roles('admin', 'profesor')
  @UseInterceptors(FileInterceptor('foto', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/perfiles';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'perfil-' + uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'), false);
        return;
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadMyFoto(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const fotoUrl = `/uploads/perfiles/${file.filename}`;
    return this.instructoresService.updateMyFoto(userId, fotoUrl);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateInstructorDto) {
    return this.instructoresService.create(dto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.instructoresService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInstructorDto) {
    return this.instructoresService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.remove(id);
  }

  @Patch(':id/toggle-activo')
  @Roles('admin')
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.toggleActivo(id);
  }

  @Post(':id/reenviar-activacion')
  @Roles('admin')
  reenviarActivacion(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.reenviarActivacion(id);
  }

  @Post(':id/upload-cv')
  @Roles('admin')
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
  @Roles('admin')
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
  @Roles('admin')
  removeCv(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.removeCv(id);
  }

  @Delete(':id/temario')
  @Roles('admin')
  removeTemario(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.removeTemario(id);
  }
}
