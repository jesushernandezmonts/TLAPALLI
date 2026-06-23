import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, Req } from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { AlumnoJwtAuthGuard } from '../auth/strategies/alumno-jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Alumnos')
@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}

  // ========== ENDPOINTS PARA ALUMNO AUTENTICADO ==========

  @Get('me/perfil')
  @UseGuards(AlumnoJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener perfil del alumno autenticado' })
  getMiPerfil(@Req() req) {
    return this.alumnosService.getAlumnoPerfil(req.user.id);
  }

  @Get('me/talleres')
  @UseGuards(AlumnoJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener talleres del alumno autenticado' })
  getMisTalleres(@Req() req) {
    return this.alumnosService.getAlumnoTalleres(req.user.id);
  }

  @Get('me/pagos')
  @UseGuards(AlumnoJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener pagos del alumno autenticado' })
  getMisPagos(@Req() req) {
    return this.alumnosService.getAlumnoPagos(req.user.id);
  }

  @Get('me/asistencias')
  @UseGuards(AlumnoJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener asistencias del alumno autenticado' })
  getMisAsistencias(@Req() req) {
    return this.alumnosService.getAlumnoAsistencias(req.user.id);
  }

  @Get('me/servicio-social')
  @UseGuards(AlumnoJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener servicio social del alumno autenticado' })
  getMiServicioSocial(@Req() req) {
    return this.alumnosService.getAlumnoServicioSocial(req.user.id);
  }

  @Get('me/tipo')
  @UseGuards(AlumnoJwtAuthGuard)
  @ApiOperation({ summary: 'Detectar tipo de alumno: talleres, servicio_social, ambos o ninguno' })
  getMiTipo(@Req() req) {
    return this.alumnosService.getTipoAlumno(req.user.id);
  }

  // ========== ENDPOINTS ADMIN/INSTRUCTOR ==========

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un nuevo alumno' })
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnosService.create(createAlumnoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'profesor')
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.alumnosService.findAll(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
    );
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'profesor')
  countAll() {
    return this.alumnosService.countAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'profesor')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlumnoDto: UpdateAlumnoDto) {
    return this.alumnosService.update(id, updateAlumnoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.remove(id);
  }
}
