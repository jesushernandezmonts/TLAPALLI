import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InstructoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInstructorDto) {
    const existe = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);

    return this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email,
        passwordHash: hash,
        rol: 'profesor',
      },
      select: { id: true, nombre: true, email: true, rol: true },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      where: { rol: 'profesor' },
      select: { id: true, nombre: true, email: true, rol: true },
    });
  }

  async findOne(id: number) {
    const instructor = await this.prisma.usuario.findFirst({
      where: { id, rol: 'profesor' },
      select: { id: true, nombre: true, email: true, rol: true },
    });
    if (!instructor) throw new NotFoundException('Instructor no encontrado');
    return instructor;
  }

  async update(id: number, dto: UpdateInstructorDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.nombre) data.nombre = dto.nombre;
    if (dto.email) data.email = dto.email;
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      data.passwordHash = await bcrypt.hash(dto.password, salt);
    }
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, rol: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({ where: { id } });
  }
}
