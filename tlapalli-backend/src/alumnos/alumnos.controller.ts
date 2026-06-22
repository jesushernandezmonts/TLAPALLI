import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Alumnos')
@Controller('alumnos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo alumno' })
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnosService.create(createAlumnoDto);
  }

  @Get()
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.alumnosService.findAll(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
    );
  }

  @Get('count')
  countAll() {
    return this.alumnosService.countAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAlumnoDto: UpdateAlumnoDto) {
    return this.alumnosService.update(id, updateAlumnoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.remove(id);
  }
}
