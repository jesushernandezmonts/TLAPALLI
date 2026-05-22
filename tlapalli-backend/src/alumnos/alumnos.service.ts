import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class AlumnosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAlumnoDto) {
    const { fechaNacimiento, ...rest } = dto;
    const fecha = fechaNacimiento ? new Date(fechaNacimiento) : undefined;
    return this.prisma.alumno.create({
      data: {
        ...rest,
        fechaNacimiento: fecha,
      },
    });
  }

  async findAll() {
    return this.prisma.alumno.findMany({
      include: {
        inscripciones: true, // opcional: para ver en qué talleres está
      },
    });
  }

  async findOne(id: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id },
      include: { inscripciones: true },
    });
    if (!alumno) throw new NotFoundException(`Alumno con id ${id} no encontrado`);
    return alumno;
  }

  async update(id: number, dto: UpdateAlumnoDto) {
    await this.findOne(id);
    const { fechaNacimiento, ...rest } = dto;
    const data: any = { ...rest };
    if (fechaNacimiento !== undefined) {
      data.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
    }
    
    return this.prisma.alumno.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Eliminar archivos físicos de documentos del alumno
    const documentos = await this.prisma.documento.findMany({ where: { alumnoId: id } });
    for (const doc of documentos) {
      const physicalPath = join(process.cwd(), doc.url);
      try {
        if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
      } catch (e) {
        console.error('No se pudo borrar archivo físico:', e);
      }
    }

    // Gracias a onDelete: Cascade en el schema, Prisma borra
    // inscripciones, asistencias, documentos y pagos automáticamente
    return this.prisma.alumno.delete({ where: { id } });
  }
}
