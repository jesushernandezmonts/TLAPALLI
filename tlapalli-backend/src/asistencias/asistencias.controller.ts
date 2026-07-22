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
@Roles('admin', 'profesor')
export class AsistenciasController {
  constructor(
    private readonly asistenciasService: AsistenciasService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Supervisión global de pases de lista de instructores para Administrador
  @Get('supervision-instructores')
  @Roles('admin')
  getSupervisionInstructores() {
    return this.asistenciasService.getSupervisionInstructores();
  }

  // Subir comprobante probatorio de falta del alumno (PDF o Imagen)
  @Post('upload-comprobante')
  @Roles('profesor')
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

  // Sincronización masiva de asistencias tomadas offline
  @Post('sync-bulk')
  @Roles('profesor')
  syncBulk(
    @Body() dtoList: CreateAsistenciasDto[],
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.asistenciasService.syncBulk(dtoList, instructorId);
  }

  // Obtener alumnos de un grupo para pasar lista
  @Get('grupo/:grupoId/alumnos')
  @Roles('admin', 'profesor')
  getAlumnosByGrupo(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Request() req,
  ) {
    const isAdmin = req.user.rol === 'admin';
    const instructorId = req.user.instructorId;
    if (!isAdmin && !instructorId) {
      throw new BadRequestException('Usuario no es instructor ni administrador');
    }
    return this.asistenciasService.getAlumnosByGrupo(grupoId, instructorId, isAdmin);
  }

  // Guardar asistencias de un grupo en una fecha
  @Post('grupo/:grupoId')
  @Roles('profesor')
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
  @Roles('admin', 'profesor')
  getAsistenciasByFecha(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Query() query: AsistenciaQueryDto,
    @Request() req,
  ) {
    const isAdmin = req.user.rol === 'admin';
    const instructorId = req.user.instructorId;
    if (!isAdmin && !instructorId) {
      throw new BadRequestException('Usuario no es instructor ni administrador');
    }
    return this.asistenciasService.getAsistenciasByFecha(grupoId, query, instructorId, isAdmin);
  }

  // Obtener historial de asistencias de un grupo
  @Get('grupo/:grupoId/historial')
  @Roles('admin', 'profesor')
  getHistorial(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Request() req,
  ) {
    const isAdmin = req.user.rol === 'admin';
    const instructorId = req.user.instructorId;
    if (!isAdmin && !instructorId) {
      throw new BadRequestException('Usuario no es instructor ni administrador');
    }
    return this.asistenciasService.getHistorial(grupoId, instructorId, isAdmin);
  }
}
