import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards, Query, Req,
} from '@nestjs/common';
import { ServicioSocialService } from './servicio-social.service';
import { CreateServicioSocialDto } from './dto/create-servicio-social.dto';
import { UpdateServicioSocialDto } from './dto/update-servicio-social.dto';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { AlumnoJwtAuthGuard } from '../auth/strategies/alumno-jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Servicio Social')
@Controller('servicio-social')
export class ServicioSocialController {
  constructor(private readonly service: ServicioSocialService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Registrar alumno en servicio social' })
  create(@Body() dto: CreateServicioSocialDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos los registros de servicio social' })
  findAll() {
    return this.service.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Estadísticas de servicio social' })
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener detalle de un registro' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('alumno/:alumnoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener servicio social por alumno' })
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.service.findByAlumno(alumnoId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar registro de servicio social' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServicioSocialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar registro de servicio social' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ========== ACTIVIDADES (admin) ==========

  @Post('actividades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Registrar horas/actividad de servicio social (admin)' })
  crearActividad(@Body() dto: CreateActividadDto) {
    return this.service.crearActividad(dto);
  }

  @Get('actividades/pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener actividades pendientes de aprobación' })
  getActividadesPendientes() {
    return this.service.getActividadesPendientes();
  }

  @Patch('actividades/:id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Aprobar una actividad pendiente' })
  aprobarActividad(@Param('id', ParseIntPipe) id: number) {
    return this.service.aprobarActividad(id, true);
  }

  @Patch('actividades/:id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Rechazar una actividad pendiente' })
  rechazarActividad(@Param('id', ParseIntPipe) id: number) {
    return this.service.aprobarActividad(id, false);
  }

  @Get(':id/actividades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener actividades de un servicio social' })
  getActividades(@Param('id', ParseIntPipe) id: number) {
    return this.service.getActividades(id);
  }

  @Delete('actividades/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar una actividad' })
  deleteActividad(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteActividad(id);
  }

  // ========== ENDPOINTS PARA ALUMNO AUTENTICADO ==========

  @Post('alumno/actividades')
  @UseGuards(AlumnoJwtAuthGuard)
  @ApiOperation({ summary: 'Alumno: registrar horas de servicio social (queda pendiente)' })
  alumnoCrearActividad(@Req() req, @Body() dto: CreateActividadDto) {
    // Forzar estatus 'pendiente' para autoreporte del alumno
    dto.estatus = 'pendiente';
    return this.service.crearActividad(dto);
  }
}
