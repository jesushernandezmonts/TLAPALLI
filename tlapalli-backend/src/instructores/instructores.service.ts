import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Injectable()
export class InstructoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInstructorDto) {
    // Verificar que el email no esté duplicado
    if (dto.email) {
      const existe = await this.prisma.instructor.findUnique({
        where: { email: dto.email },
      });
      if (existe) throw new Error('Ya existe un instructor con ese email');
    }

    return this.prisma.instructor.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        tallerId: dto.tallerId,
        activo: dto.activo ?? true,
      },
      include: { taller: true },
    });
  }

  findAll() {
    return this.prisma.instructor.findMany({
      include: { taller: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id },
      include: { taller: true },
    });
    if (!instructor) throw new NotFoundException('Instructor no encontrado');
    return instructor;
  }

  async update(id: number, dto: UpdateInstructorDto) {
    await this.findOne(id);
    return this.prisma.instructor.update({
      where: { id },
      data: dto,
      include: { taller: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.instructor.delete({ where: { id } });
  }

  // Activar/Inactivar en lugar de eliminar
  async toggleActivo(id: number) {
    const instructor = await this.findOne(id);
    return this.prisma.instructor.update({
      where: { id },
      data: { activo: !instructor.activo },
      include: { taller: true },
    });
  }
}
