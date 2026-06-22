import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePagoDto, usuarioId: number) {
    const alumno = await this.prisma.alumno.findUnique({ where: { id: dto.alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    return this.prisma.pago.create({
      data: {
        alumnoId: dto.alumnoId,
        monto: dto.monto,
        mesCorrespondiente: dto.mesCorrespondiente,
        metodoPago: dto.metodoPago || 'efectivo',
        registradoPor: usuarioId,
      },
      include: {
        alumno: true,
        usuario: {
          select: { nombre: true, email: true },
        },
      },
    });
  }

  findAll(skip?: number, take?: number) {
    const params: any = {
      include: {
        alumno: true,
        usuario: {
          select: { nombre: true, email: true },
        },
      },
      orderBy: { fechaPago: 'desc' },
    };
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    return this.prisma.pago.findMany(params);
  }

  async countAll() {
    return this.prisma.pago.count();
  }

  async findByAlumno(alumnoId: number, skip?: number, take?: number) {
    const params: any = {
      where: { alumnoId },
      orderBy: { fechaPago: 'desc' },
    };
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    return this.prisma.pago.findMany(params);
  }

  async remove(id: number) {
    return this.prisma.pago.delete({ where: { id } });
  }
}
