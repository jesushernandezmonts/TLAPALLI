import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { UpdateInscripcionDto } from './dto/update-inscripcion.dto';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class InscripcionesService {
  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
  ) {}

  async create(dto: CreateInscripcionDto) {
    // Verificar que el alumno existe
    const alumno = await this.prisma.alumno.findUnique({ where: { id: dto.alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    // Verificar que el taller existe
    const taller = await this.prisma.taller.findUnique({ where: { id: dto.tallerId } });
    if (!taller) throw new NotFoundException('Taller no encontrado');

    // Verificar cupo
    const inscripcionesActivas = await this.prisma.inscripcion.count({
      where: { tallerId: dto.tallerId, estatusPago: { not: 'baja' } },
    });
    if (inscripcionesActivas >= taller.cupoMaximo) {
      throw new BadRequestException('El taller ha alcanzado su cupo máximo');
    }

    const result = await this.prisma.inscripcion.create({
      data: {
        alumnoId: dto.alumnoId,
        tallerId: dto.tallerId,
        estatusPago: dto.estatusPago || 'pendiente',
      },
      include: { alumno: true, taller: true },
    });
    this.gateway.emitInscripcionesUpdated();
    return result;
  }

  async findAll() {
    return this.prisma.inscripcion.findMany({
      include: { alumno: true, taller: true },
      orderBy: { fechaInscripcion: 'desc' },
    });
  }

  async findByAlumno(alumnoId: number) {
    return this.prisma.inscripcion.findMany({
      where: { alumnoId },
      include: { taller: true },
    });
  }

  async findOne(id: number) {
    const inscripcion = await this.prisma.inscripcion.findUnique({
      where: { id },
      include: { alumno: true, taller: true },
    });
    if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
    return inscripcion;
  }

  async update(id: number, dto: UpdateInscripcionDto) {
    await this.findOne(id);
    const result = await this.prisma.inscripcion.update({
      where: { id },
      data: dto,
      include: { alumno: true, taller: true },
    });
    this.gateway.emitInscripcionesUpdated();
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    const result = await this.prisma.inscripcion.update({
      where: { id },
      data: { estatusPago: 'baja' },
    });
    this.gateway.emitInscripcionesUpdated();
    return result;
  }
}
```
