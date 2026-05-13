import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [alumnosCount, talleresCount, inscripcionesCount, totalPagos] = await Promise.all([
      this.prisma.alumno.count({ where: { estatusActivo: true } }),
      this.prisma.taller.count(),
      this.prisma.inscripcion.count({ where: { estatusPago: { not: 'baja' } } }),
      this.prisma.pago.aggregate({
        _sum: {
          monto: true,
        },
      }),
    ]);

    // Próximas clases (ejemplo: las de hoy o próximas 5)
    // Como no tenemos una tabla de "Clases" específica, usamos los Talleres y sus horarios
    const talleres = await this.prisma.taller.findMany({
      take: 5,
      include: {
        instructores: {
          take: 1,
        },
      },
    });

    const proximasClases = talleres.map(t => ({
      id: t.id,
      nombre: t.nombreTaller,
      hora: t.horarioDescripcion || 'Horario no definido',
      instructor: t.instructores[0]?.nombre || 'Sin instructor',
    }));

    return {
      alumnosInscritos: alumnosCount,
      talleresActivos: talleresCount,
      inscripcionesActivas: inscripcionesCount,
      ingresosTotales: totalPagos._sum.monto || 0,
      asistenciaHoy: '95%', // Placeholder hasta tener el módulo de asistencias funcionando
      proximasClases,
    };
  }
}
