import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstructoresService {
  constructor(private prisma: PrismaService) {}

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

    // 2. Crear el Instructor
    const instructor = await this.prisma.instructor.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        tallerId: dto.tallerId,
        activo: dto.activo ?? true,
      },
    });

    // 3. Si se proporcionó password, crear el Usuario vinculado (Opción B)
    if (dto.email && dto.password) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(dto.password, salt);

      await this.prisma.usuario.create({
        data: {
          nombre: dto.nombre,
          email: dto.email,
          passwordHash: passwordHash,
          rol: 'profesor',
          instructorId: instructor.id,
        },
      });
    }

    return this.prisma.instructor.findUnique({
      where: { id: instructor.id },
      include: { taller: true, usuario: true },
    });
  }

  findAll() {
    return this.prisma.instructor.findMany({
      include: { taller: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id },
      include: { taller: true },
    });
    if (!instructor) throw new NotFoundException('Instructor no encontrado');
    return instructor;
  }

  async update(id: number, dto: UpdateInstructorDto) {
    await this.findOne(id);
    return this.prisma.instructor.update({
      where: { id },
      data: dto,
      include: { taller: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.instructor.delete({ where: { id } });
  }

  // Activar/Inactivar en lugar de eliminar
  async toggleActivo(id: number) {
    const instructor = await this.findOne(id);
    return this.prisma.instructor.update({
      where: { id },
      data: { activo: !instructor.activo },
      include: { taller: true },
    });
  }
}
