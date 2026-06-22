import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ParseIntPipe, Query } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';

@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles('profesor')
  create(@Body() dto: CreatePagoDto, @Req() req) {
    return this.pagosService.create(dto, req.user.id);
  }

  @Get()
  @Roles('admin', 'profesor')
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.pagosService.findAll(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
    );
  }

  @Get('count')
  @Roles('admin', 'profesor')
  countAll() {
    return this.pagosService.countAll();
  }

  @Get('alumno/:alumnoId')
  @Roles('admin', 'profesor')
  findByAlumno(@Param('alumnoId', ParseIntPipe) alumnoId: number) {
    return this.pagosService.findByAlumno(alumnoId);
  }

  @Delete(':id')
  @Roles('profesor')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.remove(id);
  }
}
