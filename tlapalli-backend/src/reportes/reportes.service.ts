import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import { join } from 'path';

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

    // El URL guardado tiene formato '/uploads/reportes/nombre.pdf'
    // Quitamos la barra inicial si la tiene para resolver la ruta relativa correcta
    const relativeUrl = report.url.startsWith('/') ? report.url.slice(1) : report.url;
    const filePath = join(process.cwd(), relativeUrl);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error al eliminar archivo de reporte de disco: ${filePath}`, err);
    }

    return this.prisma.reporte.delete({ where: { id } });
  }
}
