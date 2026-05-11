import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTallerDto } from './dto/create-taller.dto';
import { UpdateTallerDto } from './dto/update-taller.dto';

@Injectable()
export class TalleresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTallerDto) {
    return this.prisma.taller.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.taller.findMany({ include: { inscripciones: true } });
  }

  async findOne(id: number) {
    const taller = await this.prisma.taller.findUnique({ where: { id }, include: { inscripciones: true } });
    if (!taller) throw new NotFoundException('Taller no encontrado');
    return taller;
  }

  async update(id: number, dto: UpdateTallerDto) {
    await this.findOne(id);
    return this.prisma.taller.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.taller.delete({ where: { id } });
  }
}
