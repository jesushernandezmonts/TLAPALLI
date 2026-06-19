import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { CreateGrupoAlumnoDto } from './dto/create-grupo-alumno.dto';

@Controller('grupos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('profesor')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Post()
  create(@Body() createGrupoDto: CreateGrupoDto, @Request() req) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.create(createGrupoDto, instructorId);
  }

  @Get()
  findAll(@Request() req) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.findAll(instructorId);
  }

  // ===== ALUMNOS DISPONIBLES (debe ir ANTES de :id) =====

  @Get('alumnos-disponibles')
  findAlumnosDisponibles(@Request() req) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.findAlumnosByInstructor(instructorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.findOne(id, instructorId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGrupoDto: UpdateGrupoDto,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.update(id, updateGrupoDto, instructorId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.remove(id, instructorId);
  }

  // ===== ENDPOINTS DE ALUMNOS EN GRUPOS =====

  @Post(':grupoId/alumnos')
  createAlumno(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Body() createAlumnoDto: CreateGrupoAlumnoDto,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.createAlumno(grupoId, createAlumnoDto, instructorId);
  }

  @Get(':grupoId/alumnos')
  findAlumnosByGrupo(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.findAlumnosByGrupo(grupoId, instructorId);
  }

  @Delete(':grupoId/alumnos/:alumnoId')
  removeAlumnoFromGrupo(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.removeAlumnoFromGrupo(grupoId, alumnoId, instructorId);
  }

  @Patch(':grupoId/alumnos/:alumnoId')
  updateAlumno(
    @Param('grupoId', ParseIntPipe) grupoId: number,
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Body() updateData: any,
    @Request() req,
  ) {
    const instructorId = req.user.instructorId;
    if (!instructorId) {
      throw new Error('Usuario no es instructor');
    }
    return this.gruposService.updateAlumno(grupoId, alumnoId, updateData, instructorId);
  }
}

