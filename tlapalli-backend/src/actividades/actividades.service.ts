import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActividadDto) {
    return this.prisma.actividad.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fecha: new Date(dto.fecha),
        tipo: dto.tipo,
        ubicacion: dto.ubicacion,
      },
    });
  }

  async findAll() {
    return this.prisma.actividad.findMany({
      orderBy: { fecha: 'asc' },
    });
  }

  async findOne(id: number) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id },
    });
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }
    return actividad;
  }

  async update(id: number, dto: UpdateActividadDto) {
    await this.findOne(id); // Verifica existencia

    const data: any = { ...dto };
    if (dto.fecha) {
      data.fecha = new Date(dto.fecha);
    }

    return this.prisma.actividad.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verifica existencia
    return this.prisma.actividad.delete({
      where: { id },
    });
  }
}
