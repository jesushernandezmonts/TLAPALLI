import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';

@Injectable()
export class InscripcionesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInscripcionDto) {
    // Verificar que el alumno existe
    const alumno = await this.prisma.alumno.findUnique({ where: { id: dto.alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    // Verificar que el taller existe
    const taller = await this.prisma.taller.findUnique({ where: { id: dto.tallerId } });
    if (!taller) throw new NotFoundException('Taller no encontrado');

    // Verificar cupo
    const inscritos = await this.prisma.inscripcion.count({ where: { tallerId: dto.tallerId } });
    if (inscritos >= taller.cupoMaximo) throw new BadRequestException('El taller ya está lleno');

    return this.prisma.inscripcion.create({
      data: dto,
      include: {
        alumno: true,
        taller: true,
      },
    });
  }

  async findAll() {
    return this.prisma.inscripcion.findMany({
      include: {
        alumno: true,
        taller: true,
      },
    });
  }

  async findOne(id: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: { id },
      include: { alumno: true, taller: true, asistencias: true },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    return inscripcion;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inscripcion.delete({ where: { id } });
  }
}
