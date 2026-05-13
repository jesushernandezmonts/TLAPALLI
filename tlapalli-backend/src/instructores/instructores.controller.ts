import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { InstructoresService } from './instructores.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Controller('instructores')
export class InstructoresController {
  constructor(private readonly instructoresService: InstructoresService) {}

  @Post()
  create(@Body() dto: CreateInstructorDto) {
    return this.instructoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.instructoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInstructorDto) {
    return this.instructoresService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.remove(id);
  }

  @Patch(':id/toggle-activo')
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.instructoresService.toggleActivo(id);
  }
}
