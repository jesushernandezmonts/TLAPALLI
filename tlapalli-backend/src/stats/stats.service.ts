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

    // Obtener día actual en español
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const diaActual = dias[new Date().getDay()];
    
    // Términos de búsqueda simples
    const searchTerms = [diaActual];
    if (diaActual === 'miércoles') searchTerms.push('mie');
    if (diaActual === 'sábado') searchTerms.push('sab');
    if (diaActual === 'martes') searchTerms.push('mar');
    if (diaActual === 'jueves') searchTerms.push('jue');
    if (diaActual === 'lunes') searchTerms.push('lun');
    if (diaActual === 'viernes') searchTerms.push('vie');

    // Próximas clases: Talleres que tienen el día de hoy en su descripción
    const todosTalleres = await this.prisma.taller.findMany({
      include: {
        instructores: {
          take: 1,
        },
      },
    });

    const proximasClases = todosTalleres
      .filter(t => {
        const desc = (t.horarioDescripcion || '').toLowerCase();
        // Búsqueda simple por inclusión
        return searchTerms.some(term => desc.includes(term));
      })
      .map(t => ({
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
      diaDetectado: diaActual,
      proximasClases,
    };
  }
}
