import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      alumnosCount,
      talleresCount,
      inscripcionesCount,
      totalPagos,
      pagosMes,
      pagosMesPasado,
      inscripcionesMes,
      inscripcionesMesPasado,
    ] = await Promise.all([
      this.prisma.alumno.count({ where: { estatusActivo: true } }),
      this.prisma.taller.count(),
      this.prisma.inscripcion.count({ where: { estatusPago: { not: 'baja' } } }),
      this.prisma.pago.aggregate({ _sum: { monto: true } }),
      this.prisma.pago.aggregate({ _sum: { monto: true }, where: { fechaPago: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
      this.prisma.pago.aggregate({ _sum: { monto: true }, where: { fechaPago: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      this.prisma.inscripcion.count({ where: { fechaInscripcion: { gte: startOfCurrentMonth, lte: endOfCurrentMonth } } }),
      this.prisma.inscripcion.count({ where: { fechaInscripcion: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
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

    // Conteo por Barrio/Comunidad de Huamantla
    const alumnosBarriosRaw = await this.prisma.alumno.groupBy({
      by: ['barrioComunidad'],
      _count: { id: true },
    });

    const alumnosPorBarrio = alumnosBarriosRaw.map(b => ({
      barrio: b.barrioComunidad || 'Sin especificar',
      cantidad: b._count.id,
    })).sort((a, b) => b.cantidad - a.cantidad);

    return {
      alumnosInscritos: alumnosCount,
      talleresActivos: talleresCount,
      inscripcionesActivas: inscripcionesCount,
      ingresosTotales: totalPagos._sum.monto || 0,
      diaDetectado: diaActual,
      proximasClases,
      alumnosPorBarrio,
      comparativas: {
        ingresosMes: {
          actual: Number(pagosMes._sum.monto) || 0,
          anterior: Number(pagosMesPasado._sum.monto) || 0,
        },
        inscripcionesNuevas: {
          actual: inscripcionesMes,
          anterior: inscripcionesMesPasado,
        },
      },
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

    // Alumnos por Barrio / Comunidad
    const alumnosPorBarrioMap = alumnos.reduce((acc, a) => {
      const barrio = a.barrioComunidad || 'Sin especificar';
      acc[barrio] = (acc[barrio] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const alumnosPorBarrio = Object.entries(alumnosPorBarrioMap).map(([barrio, cantidad]) => ({
      barrio,
      cantidad,
    })).sort((a, b) => b.cantidad - a.cantidad);

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
        barrioComunidad: a.barrioComunidad || 'Sin especificar',
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
      alumnosPorBarrio,
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
