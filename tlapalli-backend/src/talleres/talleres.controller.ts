import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TalleresService } from './talleres.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Talleres')
@Controller('talleres')
export class TalleresController {
  constructor(private readonly talleresService: TalleresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo taller' })
  create(@Body() createTallerDto: CreateTallerDto) {
    return this.talleresService.create(createTallerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los talleres' })
  findAll() {
    return this.talleresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un taller por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.talleresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un taller' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTallerDto: UpdateTallerDto) {
    return this.talleresService.update(id, updateTallerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un taller' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.talleresService.remove(id);
  }
}
