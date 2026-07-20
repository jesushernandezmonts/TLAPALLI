import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciasDto, AsistenciaQueryDto } from './dto/create-asistencia.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('asistencias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('profesor')
export class AsistenciasController {
  constructor(
    private readonly asistenciasService: AsistenciasService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Subir comprobante probatorio de falta del alumno (PDF o Imagen)
  @Post('upload-comprobante')
  @UseInterceptors(FileInterceptor('comprobante', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadComprobante(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo de comprobante');
    }
    const result = await this.cloudinaryService.uploadFile(file, 'asistencias/comprobantes');
    return { comprobanteUrl: result.secureUrl };
  }

  // Obtener alumnos de un grupo para pasar lista
  @Get('grupo/:grupoId/alumnos')
  getAlumnosByGrupo(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.asistenciasService.getAlumnosByGrupo(grupoId, instructorId);
  }

  // Guardar asistencias de un grupo en una fecha
  @Post('grupo/:grupoId')
  saveAsistencias(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Body() createAsistenciasDto: CreateAsistenciasDto,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    // Asegurar que el grupoId del body coincide con el de la URL
    createAsistenciasDto.grupoId = grupoId;
    return this.asistenciasService.saveAsistencias(createAsistenciasDto, instructorId);
  }

  // Obtener asistencias de un grupo en una fecha específica
  @Get('grupo/:grupoId')
  getAsistenciasByFecha(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Query() query: AsistenciaQueryDto,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.asistenciasService.getAsistenciasByFecha(grupoId, query, instructorId);
  }

  // Obtener historial de asistencias de un grupo
  @Get('grupo/:grupoId/historial')
  getHistorial(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.asistenciasService.getHistorial(grupoId, instructorId);
  }
}
