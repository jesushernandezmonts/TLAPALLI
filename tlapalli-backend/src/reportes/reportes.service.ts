import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async create(tipo: string, nombre: string, url: string) {
    return this.prisma.reporte.create({
      data: {
        tipo,
        nombre,
        url,
      },
    });
  }

  async findOne(id: number) {
    const report = await this.prisma.reporte.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return report;
  }

  async findAll() {
    return this.prisma.reporte.findMany({
      orderBy: { creadoEn: 'desc' },
    });
  }

  async remove(id: number) {
    const report = await this.prisma.reporte.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    // Intentar borrar de Cloudinary
    try {
      const publicId = report.url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)?.[1];
      if (publicId) {
        await import('cloudinary').then(({ v2: cloudinary }) => {
          return cloudinary.uploader.destroy(publicId);
        });
      }
    } catch (err) {
      console.error('Error al eliminar archivo de Cloudinary:', err);
    }

    return this.prisma.reporte.delete({ where: { id } });
  }
}
