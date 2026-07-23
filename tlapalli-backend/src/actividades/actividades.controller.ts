import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  ParseIntPipe, 
  Patch,
  Req 
} from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';

@Controller('actividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateActividadDto) {
    return this.actividadesService.create(dto);
  }

  @Post('proponer')
  @Roles('profesor')
  proponer(@Body() dto: CreateActividadDto, @Req() req: any) {
    const instructorId = req.user?.instructorId;
    return this.actividadesService.proponer(dto, instructorId);
  }

  @Get()
  @Roles('admin', 'profesor')
  findAll(@Req() req: any) {
    return this.actividadesService.findAll(req.user);
  }

  @Get(':id')
  @Roles('admin', 'profesor')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actividadesService.findOne(id);
  }

  @Patch(':id/aprobar')
  @Roles('admin')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.actividadesService.aprobar(id);
  }

  @Patch(':id/rechazar')
  @Roles('admin')
  rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.actividadesService.rechazar(id, observaciones);
  }

  @Patch(':id/cancelar')
  @Roles('admin')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.actividadesService.cancelar(id, observaciones);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateActividadDto) {
    return this.actividadesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actividadesService.remove(id);
  }
}
