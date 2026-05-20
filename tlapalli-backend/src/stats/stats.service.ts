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

  async getReportesData() {
    const [
      alumnos,
      talleres,
      instructores,
      inscripciones,
      pagos,
      actividades,
      totalPagos,
      alumnosActivos,
      alumnosInactivos,
    ] = await Promise.all([
      this.prisma.alumno.findMany({
        include: {
          inscripciones: { include: { taller: true } },
        },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.taller.findMany({
        include: {
          inscripciones: { where: { estatusPago: { not: 'baja' } } },
          instructores: true,
        },
        orderBy: { nombreTaller: 'asc' },
      }),
      this.prisma.instructor.findMany({
        include: { taller: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.inscripcion.findMany({
        include: { alumno: true, taller: true },
        orderBy: { fechaInscripcion: 'desc' },
      }),
      this.prisma.pago.findMany({
        include: {
          alumno: true,
          usuario: { select: { nombre: true } },
        },
        orderBy: { fechaPago: 'desc' },
      }),
      this.prisma.actividad.findMany({
        orderBy: { fecha: 'asc' },
      }),
      this.prisma.pago.aggregate({ _sum: { monto: true } }),
      this.prisma.alumno.count({ where: { estatusActivo: true } }),
      this.prisma.alumno.count({ where: { estatusActivo: false } }),
    ]);

    // Ingresos por método de pago
    const pagosPorMetodo = pagos.reduce((acc, p) => {
      const metodo = p.metodoPago || 'efectivo';
      acc[metodo] = (acc[metodo] || 0) + Number(p.monto);
      return acc;
    }, {} as Record<string, number>);

    // Ingresos por mes
    const pagosPorMes = pagos.reduce((acc, p) => {
      const mes = p.mesCorrespondiente;
      acc[mes] = (acc[mes] || 0) + Number(p.monto);
      return acc;
    }, {} as Record<string, number>);

    // Alumnos por taller
    const alumnosPorTaller = talleres.map(t => ({
      taller: t.nombreTaller,
      inscritos: t.inscripciones.length,
      cupoMaximo: t.cupoMaximo,
      costo: Number(t.costoMensual),
      instructor: t.instructores[0]?.nombre || 'Sin instructor',
      horario: t.horarioDescripcion || 'No definido',
    }));

    return {
      generado: new Date().toISOString(),
      resumen: {
        totalAlumnos: alumnos.length,
        alumnosActivos,
        alumnosInactivos,
        totalTalleres: talleres.length,
        totalInstructores: instructores.length,
        totalInscripciones: inscripciones.length,
        ingresosTotales: Number(totalPagos._sum.monto) || 0,
        totalActividades: actividades.length,
      },
      alumnos: alumnos.map(a => ({
        id: a.id,
        nombre: `${a.nombre} ${a.apellidoPaterno} ${a.apellidoMaterno || ''}`.trim(),
        curp: a.curp || '-',
        telefono: a.telefono || '-',
        activo: a.estatusActivo,
        talleres: a.inscripciones
          .filter(i => i.estatusPago !== 'baja')
          .map(i => i.taller.nombreTaller),
        totalInscripciones: a.inscripciones.filter(i => i.estatusPago !== 'baja').length,
      })),
      pagos: pagos.map(p => ({
        id: p.id,
        alumno: `${p.alumno.nombre} ${p.alumno.apellidoPaterno}`,
        monto: Number(p.monto),
        mes: p.mesCorrespondiente,
        metodo: p.metodoPago || 'efectivo',
        fecha: p.fechaPago,
        registradoPor: p.usuario?.nombre || '-',
      })),
      pagosPorMetodo,
      pagosPorMes,
      talleres: alumnosPorTaller,
      instructores: instructores.map(i => ({
        id: i.id,
        nombre: i.nombre,
        email: i.email || '-',
        telefono: i.telefono || '-',
        estado: i.estado,
        taller: i.taller?.nombreTaller || 'Sin taller',
      })),
      actividades: actividades.map(a => ({
        id: a.id,
        titulo: a.titulo,
        descripcion: a.descripcion || '-',
        fecha: a.fecha,
        tipo: a.tipo,
        ubicacion: a.ubicacion,
      })),
    };
  }
}
