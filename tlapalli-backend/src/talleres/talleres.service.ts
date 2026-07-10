import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class TalleresService {
  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
  ) {}

  async create(dto: CreateTallerDto) {
    const result = await this.prisma.taller.create({
      data: dto,
    });
    this.gateway.emitTalleresUpdated();
    return result;
  }

  async findAll() {
    return this.prisma.taller.findMany({
      include: {
        instructores: true,
        inscripciones: {
          include: {
            alumno: true,
          },
        },
      },
      orderBy: [
        { activo: 'desc' },
        { id: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const taller = await this.prisma.taller.findUnique({
      where: { id },
      include: {
        instructores: true,
        inscripciones: {
          include: {
            alumno: true,
          },
        },
      },
    });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    return taller;
  }

    const result = await this.prisma.taller.update({
      where: { id },
      data: dto,
    });
    this.gateway.emitTalleresUpdated();
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    const result = await this.prisma.taller.update({
      where: { id },
      data: { activo: false },
    });
    this.gateway.emitTalleresUpdated();
    return result;
  }
}
