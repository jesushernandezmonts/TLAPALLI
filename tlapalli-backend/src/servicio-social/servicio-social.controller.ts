import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { ServicioSocialService } from './servicio-social.service';
import { CreateServicioSocialDto } from './dto/create-servicio-social.dto';
import { UpdateServicioSocialDto } from './dto/update-servicio-social.dto';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Servicio Social')
@Controller('servicio-social')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ServicioSocialController {
  constructor(private readonly service: ServicioSocialService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar alumno en servicio social' })
  create(@Body() dto: CreateServicioSocialDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los registros de servicio social' })
  findAll() {
    return this.service.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de servicio social' })
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un registro' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get('alumno/:alumnoId')
  @ApiOperation({ summary: 'Obtener servicio social por alumno' })
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.service.findByAlumno(alumnoId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar registro de servicio social' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServicioSocialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro de servicio social' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // ========== ACTIVIDADES ==========

  @Post('actividades')
  @ApiOperation({ summary: 'Registrar horas/actividad de servicio social' })
  crearActividad(@Body() dto: CreateActividadDto) {
    return this.service.crearActividad(dto);
  }

  @Get(':id/actividades')
  @ApiOperation({ summary: 'Obtener actividades de un servicio social' })
  getActividades(@Param('id', ParseIntPipe) id: number) {
    return this.service.getActividades(id);
  }

  @Delete('actividades/:id')
  @ApiOperation({ summary: 'Eliminar una actividad' })
  deleteActividad(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteActividad(id);
  }
}
