import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class PagosService {
  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
  ) {}

  async create(dto: CreatePagoDto, usuarioId: number) {
    const alumno = await this.prisma.alumno.findUnique({ where: { id: dto.alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const result = await this.prisma.pago.create({
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
    this.gateway.emitPagosUpdated();
    return result;
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
    const result = await this.prisma.pago.delete({ where: { id } });
    this.gateway.emitPagosUpdated();
    return result;
  }
}
