import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailerService } from '../mail/mailer.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';


@Injectable()
export class InstructoresService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateInstructorDto) {
    // 1. Verificar si ya existe un instructor o usuario con ese email
    if (dto.email) {
      const existeInstructor = await this.prisma.instructor.findUnique({
        where: { email: dto.email },
      });
      if (existeInstructor) throw new BadRequestException('Ya existe un instructor con ese email');

      const existeUsuario = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });
      if (existeUsuario) throw new BadRequestException('Ya existe un usuario con ese email');
    }

    // 2. Crear el Instructor con estado "Pendiente"
    const instructor = await this.prisma.instructor.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        tallerId: dto.tallerId,
        estado: 'Pendiente',
        activo: true,
      },
    });

    // 3. Si se proporcionó email, crear Usuario sin contraseña y enviar email de activación
    if (dto.email) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      await this.prisma.usuario.create({
        data: {
          nombre: dto.nombre,
          email: dto.email,
          passwordHash: null,
          rol: 'profesor',
          instructorId: instructor.id,
          resetToken: token,
          resetTokenExp: expires,
        },
      });

      // Obtener el nombre del taller para incluirlo en el correo
      let tallerNombre: string | undefined;
      if (dto.tallerId) {
        const taller = await this.prisma.taller.findUnique({ where: { id: dto.tallerId } });
        tallerNombre = taller?.nombreTaller;
      }

      await this.mailerService.sendActivationEmail(dto.email, token, dto.nombre, tallerNombre);
    }

    return this.prisma.instructor.findUnique({
      where: { id: instructor.id },
      include: { taller: true, usuario: true },
    });
  }

  findAll() {
    return this.prisma.instructor.findMany({
      include: { taller: true, usuario: { select: { id: true, email: true, passwordHash: false, googleId: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id },
      include: { taller: true, usuario: { select: { id: true, email: true, googleId: true, fotoUrl: true } } },
    });
    if (!instructor) throw new NotFoundException('Instructor no encontrado');
    return instructor;
  }

  async update(id: number, dto: UpdateInstructorDto) {
    const existing = await this.findOne(id);

    // 1. Validar si el email ha cambiado y si el nuevo ya existe
    if (dto.email && dto.email !== existing.email) {
      const existeInstructor = await this.prisma.instructor.findFirst({
        where: {
          email: dto.email,
          id: { not: id },
        },
      });
      if (existeInstructor) {
        throw new BadRequestException('Ya existe un instructor registrado con ese email.');
      }

      const existeUsuario = await this.prisma.usuario.findFirst({
        where: {
          email: dto.email,
          instructorId: { not: id },
        },
      });
      if (existeUsuario) {
        throw new BadRequestException('Ya existe un usuario registrado con ese email.');
      }
    }

    // 2. Actualizar el Instructor
    const updatedInstructor = await this.prisma.instructor.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        tallerId: dto.tallerId,
        activo: dto.activo,
      },
      include: { taller: true },
    });

    // 3. Sincronizar con el Usuario vinculado si existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { instructorId: id },
    });

    if (usuario) {
      const usuarioUpdateData: any = {};
      if (dto.nombre) usuarioUpdateData.nombre = dto.nombre;
      if (dto.email) usuarioUpdateData.email = dto.email;

      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: usuarioUpdateData,
      });

      // 4. Si el instructor sigue Pendiente y se cambió el correo, re-generar token de activación y enviar correo nuevo
      if (existing.estado === 'Pendiente' && dto.email && dto.email !== existing.email) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        await this.prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            resetToken: token,
            resetTokenExp: expires,
          },
        });

        let tallerNombre: string | undefined;
        const tallerIdToUse = dto.tallerId !== undefined ? dto.tallerId : existing.tallerId;
        if (tallerIdToUse) {
          const taller = await this.prisma.taller.findUnique({ where: { id: tallerIdToUse } });
          tallerNombre = taller?.nombreTaller;
        }

        await this.mailerService.sendActivationEmail(dto.email, token, dto.nombre || existing.nombre, tallerNombre);
      }
    }

    return updatedInstructor;
  }

  async remove(id: number) {
    const instructor = await this.findOne(id);

    // Borrar el Usuario vinculado primero
    const usuario = await this.prisma.usuario.findUnique({ where: { instructorId: id } });
    if (usuario) {
      // 1. Desvincular de los pagos registrados por este usuario para evitar error FK
      await this.prisma.pago.updateMany({
        where: { registradoPor: usuario.id },
        data: { registradoPor: null },
      });

      // 2. Borrar RefreshTokens
      await this.prisma.refreshToken.deleteMany({ where: { usuarioId: usuario.id } });

      // 3. Borrar el Usuario
      await this.prisma.usuario.delete({ where: { id: usuario.id } });
    }

    // Borrar archivos de Cloudinary
    if (instructor.curriculumUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(instructor.curriculumUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }
    if (instructor.temarioUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(instructor.temarioUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }

    return this.prisma.instructor.delete({ where: { id } });
  }

  // Activar/Inactivar en lugar de eliminar
  async toggleActivo(id: number) {
    const instructor = await this.findOne(id);
    const newActivo = !instructor.activo;
    let newEstado = instructor.estado;
    
    // Si se desactiva, estado es Inactivo. Si se activa, regresa a Pendiente o Activo
    if (!newActivo) {
      newEstado = 'Inactivo';
    } else {
      // Verificar si el usuario ya tiene password o usó googleId
      const usuario = await this.prisma.usuario.findUnique({ where: { instructorId: id } });
      if (usuario && (usuario.passwordHash || usuario.googleId)) {
        newEstado = 'Activo';
      } else {
        newEstado = 'Pendiente';
      }
    }

    return this.prisma.instructor.update({
      where: { id },
      data: { activo: newActivo, estado: newEstado },
      include: { taller: true },
    });
  }

  async reenviarActivacion(id: number) {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id },
      include: { taller: true },
    });
    if (!instructor) throw new NotFoundException('Instructor no encontrado');
    if (!instructor.email) {
      throw new BadRequestException('El instructor no tiene correo registrado');
    }

    const usuario = await this.prisma.usuario.findUnique({ where: { instructorId: id } });
    if (!usuario) {
      throw new BadRequestException('El instructor no tiene un usuario vinculado');
    }

    const token = crypto.randomBytes(32).toString('hex');

    // Si ya activó su cuenta, enviar enlace de restablecimiento (15 min)
    // Si sigue pendiente, enviar enlace de activación (24 horas)
    const isActivo = instructor.estado === 'Activo' || !!usuario.passwordHash || !!usuario.googleId;
    const expires = isActivo
      ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutos para reset
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas para activación

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: token,
        resetTokenExp: expires,
      },
    });

    if (isActivo) {
      // Si ya estaba activo, es como un reseteo de password
      await this.mailerService.sendResetPasswordEmail(instructor.email, token);
    } else {
      // Si sigue pendiente, reenviar activación
      const tallerNombre = instructor.taller?.nombreTaller;
      await this.mailerService.sendActivationEmail(instructor.email, token, instructor.nombre, tallerNombre);
    }
    
    return { message: 'Enlace enviado exitosamente' };
  }

  async updateCvUrl(id: number, url: string, cloudinaryService?: CloudinaryService) {
    const instructor = await this.findOne(id);
    if (instructor.curriculumUrl) {
      const svc = cloudinaryService || this.cloudinaryService;
      const publicId = svc.extractPublicIdFromUrl(instructor.curriculumUrl);
      if (publicId) await svc.deleteFile(publicId);
    }
    return this.prisma.instructor.update({
      where: { id },
      data: { curriculumUrl: url },
      include: { taller: true, usuario: { select: { id: true, email: true, googleId: true } } },
    });
  }

  async updateTemarioUrl(id: number, url: string, cloudinaryService?: CloudinaryService) {
    const instructor = await this.findOne(id);
    if (instructor.temarioUrl) {
      const svc = cloudinaryService || this.cloudinaryService;
      const publicId = svc.extractPublicIdFromUrl(instructor.temarioUrl);
      if (publicId) await svc.deleteFile(publicId);
    }
    return this.prisma.instructor.update({
      where: { id },
      data: { temarioUrl: url },
      include: { taller: true, usuario: { select: { id: true, email: true, googleId: true } } },
    });
  }

  async removeCv(id: number) {
    const instructor = await this.findOne(id);
    if (instructor.curriculumUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(instructor.curriculumUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }
    return this.prisma.instructor.update({
      where: { id },
      data: { curriculumUrl: null },
      include: { taller: true, usuario: { select: { id: true, email: true, googleId: true } } },
    });
  }

  async removeTemario(id: number) {
    const instructor = await this.findOne(id);
    if (instructor.temarioUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(instructor.temarioUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }
    return this.prisma.instructor.update({
      where: { id },
      data: { temarioUrl: null },
      include: { taller: true, usuario: { select: { id: true, email: true, googleId: true } } },
    });
  }



  async updateMyProfile(userId: number, dto: UpdateProfileDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const data: any = {};
    if (dto.nombre) data.nombre = dto.nombre;

    const updated = await this.prisma.usuario.update({
      where: { id: userId },
      data,
      select: { id: true, nombre: true, email: true, rol: true, fotoUrl: true },
    });

    // Si el usuario es instructor, también actualizar su nombre en instructor
    if (usuario.instructorId) {
      await this.prisma.instructor.update({
        where: { id: usuario.instructorId },
        data: { nombre: dto.nombre },
      });
    }

    return updated;
  }

  async updateMyFoto(userId: number, fotoUrl: string, cloudinaryService?: CloudinaryService) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Borrar foto anterior si existe
    if (usuario.fotoUrl) {
      const svc = cloudinaryService || this.cloudinaryService;
      const publicId = svc.extractPublicIdFromUrl(usuario.fotoUrl);
      if (publicId) await svc.deleteFile(publicId);
    }

    return this.prisma.usuario.update({
      where: { id: userId },
      data: { fotoUrl },
      select: { id: true, nombre: true, email: true, rol: true, fotoUrl: true },
    });
  }
}
