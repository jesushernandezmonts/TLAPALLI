import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  async upload(alumnoId: number, nombre: string, tipo: string, url: string) {
    return this.prisma.documento.create({
      data: { nombre, tipo, url, alumnoId },
    });
  }

  findByAlumno(alumnoId: number) {
    return this.prisma.documento.findMany({
      where: { alumnoId },
      orderBy: { subidoEn: 'desc' },
    });
  }

  async remove(id: number) {
    const doc = await this.prisma.documento.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    // Aquí deberías borrar el archivo físico del servidor/nube
    return this.prisma.documento.delete({ where: { id } });
  }
}
