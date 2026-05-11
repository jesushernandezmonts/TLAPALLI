import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Inscripciones')
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  @ApiOperation({ summary: 'Inscribir un alumno a un taller' })
  create(@Body() createInscripcionDto: CreateInscripcionDto) {
    return this.inscripcionesService.create(createInscripcionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las inscripciones' })
  findAll() {
    return this.inscripcionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una inscripción' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una inscripción' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.remove(id);
  }
}
