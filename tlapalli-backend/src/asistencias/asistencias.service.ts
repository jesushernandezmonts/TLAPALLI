import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsistenciasDto, AsistenciaQueryDto } from './dto/create-asistencia.dto';

@Injectable()
export class AsistenciasService {
  constructor(private prisma: PrismaService) {}

  // Obtener alumnos de un grupo con su grupoAlumnoId para pasar lista
  async getAlumnosByGrupo(grupoId: number, instructorId: number) {
    // Verificar que el grupo pertenece al instructor
    await this.verifyGrupoOwnership(grupoId, instructorId);

    return this.prisma.grupoAlumno.findMany({
      where: { grupoId },
      include: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            telefono: true,
          },
        },
      },
      orderBy: {
        alumno: {
          apellidoPaterno: 'asc',
        },
      },
    });
  }

  // Guardar asistencias de un grupo en una fecha específica
  async saveAsistencias(dto: CreateAsistenciasDto, instructorId: number) {
    const { grupoId, fecha, asistencias } = dto;

    // Verificar que el grupo pertenece al instructor
    await this.verifyGrupoOwnership(grupoId, instructorId);

    // Verificar que todos los grupoAlumnoId pertenecen al grupo
    const grupoAlumnos = await this.prisma.grupoAlumno.findMany({
      where: { grupoId },
      select: { id: true },
    });
    const validIds = new Set(grupoAlumnos.map(ga => ga.id));
    
    for (const a of asistencias) {
      if (!validIds.has(a.grupoAlumnoId)) {
        throw new NotFoundException(
          `GrupoAlumno con ID ${a.grupoAlumnoId} no pertenece al grupo ${grupoId}`,
        );
      }
    }

    // Convertir fecha a Date (inicio del día)
    const fechaDate = new Date(fecha + 'T00:00:00.000Z');

    // Usar transacción para atomicidad
    return this.prisma.$transaction(async (tx) => {
      // Eliminar asistencias existentes para este grupo y fecha
      const existingAsistencias = await tx.asistencia.findMany({
        where: {
          fecha: {
            gte: fechaDate,
            lt: new Date(fechaDate.getTime() + 24 * 60 * 60 * 1000),
          },
          grupoAlumno: {
            grupoId,
          },
        },
        select: { id: true },
      });

      if (existingAsistencias.length > 0) {
        await tx.asistencia.deleteMany({
          where: {
            id: { in: existingAsistencias.map(a => a.id) },
          },
        });
      }

      // Crear nuevas asistencias
      for (const a of asistencias) {
        await tx.asistencia.create({
          data: {
            grupoAlumnoId: a.grupoAlumnoId,
            fecha: fechaDate,
            estado: a.estado,
            observaciones: a.observaciones,
          },
        });
      }

      return { message: 'Asistencias guardadas correctamente', fecha, total: asistencias.length };
    });
  }

  // Obtener asistencias de un grupo en una fecha
  async getAsistenciasByFecha(grupoId: number, query: AsistenciaQueryDto, instructorId: number) {
    await this.verifyGrupoOwnership(grupoId, instructorId);

    const fechaStr = query.fecha || new Date().toISOString().split('T')[0];
    const fechaDate = new Date(fechaStr + 'T00:00:00.000Z');

    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        fecha: {
          gte: fechaDate,
          lt: new Date(fechaDate.getTime() + 24 * 60 * 60 * 1000),
        },
        grupoAlumno: {
          grupoId,
        },
      },
      include: {
        grupoAlumno: {
          include: {
            alumno: {
              select: {
                id: true,
                nombre: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                telefono: true,
              },
            },
          },
        },
      },
      orderBy: {
        grupoAlumno: {
          alumno: {
            apellidoPaterno: 'asc',
          },
        },
      },
    });

    return asistencias;
  }

  // Obtener historial de fechas con asistencias registradas
  async getHistorial(grupoId: number, instructorId: number) {
    await this.verifyGrupoOwnership(grupoId, instructorId);

    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        grupoAlumno: {
          grupoId,
        },
      },
      select: {
        fecha: true,
        estado: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Agrupar por fecha para dar un resumen
    const historialMap = new Map<string, { total: number; asistencias: number; faltas: number }>();

    for (const a of asistencias) {
      const fechaKey = a.fecha.toISOString().split('T')[0];
      if (!historialMap.has(fechaKey)) {
        historialMap.set(fechaKey, { total: 0, asistencias: 0, faltas: 0 });
      }
      const entry = historialMap.get(fechaKey)!;
      entry.total++;
      if (a.estado === 'asistencia') entry.asistencias++;
      else if (a.estado === 'falta') entry.faltas++;
    }

    return Array.from(historialMap.entries())
      .map(([fecha, resumen]) => ({
        fecha,
        ...resumen,
      }))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  // Helper: verificar que el grupo pertenece al instructor
  private async verifyGrupoOwnership(grupoId: number, instructorId: number) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado`);
    }

    if (grupo.instructorId !== instructorId) {
      throw new ForbiddenException('No tienes permisos para acceder a este grupo');
    }
  }
}
