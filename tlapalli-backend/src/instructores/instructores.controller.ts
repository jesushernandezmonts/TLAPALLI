import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { InstructoresService } from './instructores.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('instructores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstructoresController {
  constructor(
    private readonly instructoresService: InstructoresService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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
    storage: memoryStorage(),
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
    if (!file) {
      throw new BadRequestException('No se recibió la imagen');
    }
    const result = await this.cloudinaryService.uploadFile(file, 'perfiles');
    const userId = req.user.id;
    return this.instructoresService.updateMyFoto(userId, result.secureUrl, this.cloudinaryService);
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
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadCv(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió el archivo');
    }
    const result = await this.cloudinaryService.uploadFile(file, 'instructores/cv');
    return this.instructoresService.updateCvUrl(id, result.secureUrl, this.cloudinaryService);
  }

  @Post(':id/upload-temario')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('temario', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadTemario(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió el archivo');
    }
    const result = await this.cloudinaryService.uploadFile(file, 'instructores/temario');
    return this.instructoresService.updateTemarioUrl(id, result.secureUrl, this.cloudinaryService);
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
