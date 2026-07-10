import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioSocialDto } from './dto/create-servicio-social.dto';
import { UpdateServicioSocialDto } from './dto/update-servicio-social.dto';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class ServicioSocialService {
  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
  ) {}

  async create(dto: CreateServicioSocialDto) {
    const alumno = await this.prisma.alumno.findUnique({ where: { id: dto.alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');

    const existente = await this.prisma.servicioSocial.findFirst({
      where: { alumnoId: dto.alumnoId, estatus: { in: ['en_curso', 'pendiente'] } },
    });
    if (existente) {
      throw new BadRequestException('El alumno ya tiene un servicio social activo');
    }

    return this.prisma.servicioSocial.create({
      data: {
        alumnoId: dto.alumnoId,
        horasRequeridas: dto.horasRequeridas || 480,
        institucion: dto.institucion,
        programa: dto.programa,
        supervisor: dto.supervisor,
        observaciones: dto.observaciones,
        fechaInicio: new Date(),
      },
      include: { alumno: { select: { nombre: true, apellidoPaterno: true } } },
    });
  }

  async findAll() {
    return this.prisma.servicioSocial.findMany({
      include: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            curp: true,
          },
        },
        _count: { select: { actividades: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.servicioSocial.findUnique({
      where: { id },
      include: {
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            curp: true,
            telefono: true,
          },
        },
        actividades: {
          orderBy: { fecha: 'desc' },
        },
      },
    });
    if (!record) throw new NotFoundException('Registro de servicio social no encontrado');
    return record;
  }

  async findByAlumno(alumnoId: number) {
    return this.prisma.servicioSocial.findMany({
      where: { alumnoId },
      include: {
        actividades: { orderBy: { fecha: 'desc' } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async update(id: number, dto: UpdateServicioSocialDto) {
    await this.findOne(id);
    return this.prisma.servicioSocial.update({
      where: { id },
      data: dto,
      include: { alumno: { select: { nombre: true, apellidoPaterno: true } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.servicioSocial.delete({ where: { id } });
  }

  // ========== ACTIVIDADES ==========

  /**
   * Crear una actividad. Si `estatus` se envía como 'pendiente' (alumno),
   * no se suma a horasCompletadas. Si es 'aprobada' (admin), se suma.
   */
  async crearActividad(dto: CreateActividadDto) {
    const ss = await this.prisma.servicioSocial.findUnique({ where: { id: dto.servicioSocialId } });
    if (!ss) throw new NotFoundException('Registro de servicio social no encontrado');
    if (ss.estatus === 'completado') {
      throw new BadRequestException('El servicio social ya está completado');
    }
    if (ss.estatus === 'baja') {
      throw new BadRequestException('El servicio social está dado de baja');
    }

    const estatus = dto.estatus || 'aprobada';

    const actividad = await this.prisma.actividadServicioSocial.create({
      data: {
        servicioSocialId: dto.servicioSocialId,
        horas: dto.horas,
        descripcion: dto.descripcion,
        comentarios: dto.comentarios,
        evidenciaUrl: dto.evidenciaUrl,
        estatus,
      },
    });

    // Solo recalcular si es aprobada
    if (estatus === 'aprobada') {
      await this._recalcularHoras(dto.servicioSocialId);
    }

    return actividad;
  }

  /**
   * Aprobar o rechazar una actividad pendiente (admin)
   */
  async aprobarActividad(id: number, aprobada: boolean) {
    const actividad = await this.prisma.actividadServicioSocial.findUnique({
      where: { id },
      include: { servicioSocial: true },
    });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    if (actividad.estatus !== 'pendiente') {
      throw new BadRequestException('La actividad ya fue procesada');
    }

    const nuevoEstatus = aprobada ? 'aprobada' : 'rechazada';

    await this.prisma.actividadServicioSocial.update({
      where: { id },
      data: { estatus: nuevoEstatus },
    });

    // Si se aprueba, recalcular horas
    if (aprobada) {
      await this._recalcularHoras(actividad.servicioSocialId);
    }

    return this.prisma.actividadServicioSocial.findUnique({ where: { id } });
  }

  /** Obtener actividades pendientes (para admin) */
  async getActividadesPendientes() {
    return this.prisma.actividadServicioSocial.findMany({
      where: { estatus: 'pendiente' },
      include: {
        servicioSocial: {
          include: {
            alumno: {
              select: { id: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async getActividades(servicioSocialId: number) {
    return this.prisma.actividadServicioSocial.findMany({
      where: { servicioSocialId },
      orderBy: { fecha: 'desc' },
    });
  }

  async deleteActividad(id: number) {
    const actividad = await this.prisma.actividadServicioSocial.findUnique({
      where: { id },
      include: { servicioSocial: true },
    });
    if (!actividad) throw new NotFoundException('Actividad no encontrada');

    await this.prisma.actividadServicioSocial.delete({ where: { id } });

    // Recalcular si la actividad eliminada estaba aprobada
    if (actividad.estatus === 'aprobada') {
      await this._recalcularHoras(actividad.servicioSocialId);
    }

    return { message: 'Actividad eliminada' };
  }

  /** Recalcula horasCompletadas desde actividades aprobadas */
  private async _recalcularHoras(servicioSocialId: number) {
    const totalHoras = await this.prisma.actividadServicioSocial.aggregate({
      where: { servicioSocialId, estatus: 'aprobada' },
      _sum: { horas: true },
    });

    const ss = await this.prisma.servicioSocial.findUnique({ where: { id: servicioSocialId } });
    if (!ss) return;

    const horasCompletadas = totalHoras._sum.horas || 0;
    const estatus = horasCompletadas >= ss.horasRequeridas ? 'completado' : 'en_curso';

    await this.prisma.servicioSocial.update({
      where: { id: servicioSocialId },
      data: {
        horasCompletadas,
        estatus,
        fechaFin: estatus === 'completado' ? new Date() : null,
      },
    });
  }

  // ========== ESTADÍSTICAS ==========

  async getStats() {
    const total = await this.prisma.servicioSocial.count();
    const enCurso = await this.prisma.servicioSocial.count({ where: { estatus: 'en_curso' } });
    const completados = await this.prisma.servicioSocial.count({ where: { estatus: 'completado' } });
    const suspendidos = await this.prisma.servicioSocial.count({ where: { estatus: 'suspendido' } });
    const bajas = await this.prisma.servicioSocial.count({ where: { estatus: 'baja' } });

    return { total, enCurso, completados, suspendidos, bajas };
  }
}
