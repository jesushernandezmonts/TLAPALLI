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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciasDto, AsistenciaQueryDto } from './dto/create-asistencia.dto';

@Controller('asistencias')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('profesor')
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

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
