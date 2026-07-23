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
        estatus: 'aprobado',
      },
      include: {
        instructor: true,
      },
    });
  }

  async proponer(dto: CreateActividadDto, instructorId?: number) {
    return this.prisma.actividad.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fecha: new Date(dto.fecha),
        tipo: dto.tipo || 'interna',
        ubicacion: dto.ubicacion || 'galeria',
        estatus: 'pendiente',
        instructorId: instructorId || null,
      },
      include: {
        instructor: true,
      },
    });
  }

  async findAll(user?: any) {
    if (user?.rol === 'admin') {
      return this.prisma.actividad.findMany({
        include: {
          instructor: true,
        },
        orderBy: { fecha: 'asc' },
      });
    }

    // Para profesor: devolver aprobados o propuestos por él mismo
    const instructorId = user?.instructorId;
    return this.prisma.actividad.findMany({
      where: {
        OR: [
          { estatus: 'aprobado' },
          ...(instructorId ? [{ instructorId: instructorId }] : []),
        ],
      },
      include: {
        instructor: true,
      },
      orderBy: { fecha: 'asc' },
    });
  }

  async findOne(id: number) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id },
      include: { instructor: true },
    });
    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }
    return actividad;
  }

  async update(id: number, dto: UpdateActividadDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.fecha) {
      data.fecha = new Date(dto.fecha);
    }

    return this.prisma.actividad.update({
      where: { id },
      data,
      include: { instructor: true },
    });
  }

  async aprobar(id: number) {
    await this.findOne(id);
    return this.prisma.actividad.update({
      where: { id },
      data: { estatus: 'aprobado' },
      include: { instructor: true },
    });
  }

  async rechazar(id: number, observaciones?: string) {
    await this.findOne(id);
    return this.prisma.actividad.update({
      where: { id },
      data: { 
        estatus: 'rechazado',
        observacionesAdmin: observaciones || null,
      },
      include: { instructor: true },
    });
  }

  async cancelar(id: number, observaciones?: string) {
    await this.findOne(id);
    return this.prisma.actividad.update({
      where: { id },
      data: { 
        estatus: 'cancelado',
        observacionesAdmin: observaciones || null,
      },
      include: { instructor: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.actividad.delete({
      where: { id },
    });
  }
}
