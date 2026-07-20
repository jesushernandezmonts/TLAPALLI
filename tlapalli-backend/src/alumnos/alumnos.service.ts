import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import * as fs from 'fs';
import { join } from 'path';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class AlumnosService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private gateway: AppGateway,
  ) {}

  // ========== MÉTODOS PARA ALUMNO AUTENTICADO ==========

  async getAlumnoPerfil(id: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        curp: true,
        fechaNacimiento: true,
        telefono: true,
        padecimientos: true,
        email: true,
        fotoUrl: true,
      },
    });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    return alumno;
  }

  async getAlumnoTalleres(id: number) {
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { alumnoId: id },
      include: {
        taller: {
          select: {
            id: true,
            nombreTaller: true,
            horarioDescripcion: true,
            costoMensual: true,
          },
        },
      },
      orderBy: { fechaInscripcion: 'desc' },
    });
    return inscripciones;
  }

  async getAlumnoPagos(id: number) {
    return this.prisma.pago.findMany({
      where: { alumnoId: id },
      orderBy: { fechaPago: 'desc' },
    });
  }

  async getAlumnoAsistencias(id: number) {
    // Asistencias a través de inscripciones y grupoAlumno
    const inscripciones = await this.prisma.inscripcion.findMany({
      where: { alumnoId: id },
      select: { id: true },
    });
    const inscripcionIds = inscripciones.map(i => i.id);

    const grupoAlumno = await this.prisma.grupoAlumno.findMany({
      where: { alumnoId: id },
      select: { id: true },
    });
    const grupoAlumnoIds = grupoAlumno.map(g => g.id);

    return this.prisma.asistencia.findMany({
      where: {
        OR: [
          { inscripcionId: { in: inscripcionIds } },
          { grupoAlumnoId: { in: grupoAlumnoIds } },
        ],
      },
      include: {
        inscripcion: {
          include: { taller: { select: { nombreTaller: true } } },
        },
        grupoAlumno: {
          include: { grupo: { select: { nombre: true } } },
        },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async getAlumnoServicioSocial(id: number) {
    return this.prisma.servicioSocial.findMany({
      where: { alumnoId: id },
      include: {
        actividades: {
          orderBy: { fecha: 'desc' },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  /** Detecta automáticamente qué tiene el alumno: talleres, servicio_social, ambos o ninguno */
  async getTipoAlumno(id: number) {
    const inscripciones = await this.prisma.inscripcion.count({ where: { alumnoId: id } });
    const servicioSocial = await this.prisma.servicioSocial.count({ where: { alumnoId: id } });

    const tieneTalleres = inscripciones > 0;
    const tieneSS = servicioSocial > 0;

    let tipo: string;
    if (tieneTalleres && tieneSS) tipo = 'ambos';
    else if (tieneTalleres) tipo = 'talleres';
    else if (tieneSS) tipo = 'servicio_social';
    else tipo = 'ninguno';

    return { tipo, inscripciones, servicioSocial };
  }

  // ========== MÉTODOS ADMIN/INSTRUCTOR ==========

  async create(dto: CreateAlumnoDto) {
    const { fechaNacimiento, email, periodo, anio, ...rest } = dto;
    const fecha = fechaNacimiento ? new Date(fechaNacimiento) : undefined;
    let savedAlumno;
    try {
      savedAlumno = await this.prisma.alumno.create({
        data: {
          ...rest,
          email: email || null,
          fechaNacimiento: fecha,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const target = error.meta?.target?.join(', ') || '';
        if (target.includes('curp')) {
          throw new BadRequestException('Ya existe un alumno registrado con esa CURP.');
        }
        if (target.includes('email')) {
          throw new BadRequestException('Ya existe un alumno registrado con ese email.');
        }
      }
      throw error;
    }

    // Si se proporcionó email, enviar automáticamente el correo de activación
    if (email) {
      try {
        await this.authService.crearAccesoAlumno(savedAlumno.id, email);
      } catch (err) {
        // El alumno se creó, pero si falla el envío del correo, no bloqueamos
        console.error(`⚠️ Alumno creado pero falló envío de activación a ${email}:`, err.message);
      }
    }

    this.gateway.emitAlumnosUpdated();
    return savedAlumno;
  }

  async findAll(skip?: number, take?: number) {
    const params: any = {
      include: {
        inscripciones: true,
      },
      orderBy: { id: 'desc' },
    };
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    return this.prisma.alumno.findMany(params);
  }

  async countAll() {
    return this.prisma.alumno.count();
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
    const { fechaNacimiento, periodo, anio, ...rest } = dto;
    const data: any = { ...rest };
    if (fechaNacimiento !== undefined) {
      data.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
    }
    
    const updated = await this.prisma.alumno.update({
      where: { id },
      data,
    });

    this.gateway.emitAlumnosUpdated();
    return updated;
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
    const result = await this.prisma.alumno.delete({ where: { id } });
    this.gateway.emitAlumnosUpdated();
    return result;
  }
}
