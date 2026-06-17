import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { CreateGrupoAlumnoDto } from './dto/create-grupo-alumno.dto';

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  async create(createGrupoDto: CreateGrupoDto, instructorId: number) {
    return await this.prisma.grupo.create({
      data: {
        nombre: createGrupoDto.nombre,
        descripcion: createGrupoDto.descripcion,
        instructorId,
      },
    });
  }

  async findAll(instructorId: number) {
    return await this.prisma.grupo.findMany({
      where: { instructorId },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: number, instructorId: number) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }

    if (grupo.instructorId !== instructorId) {
      throw new ForbiddenException('No tienes permisos para acceder a este grupo');
    }

    return grupo;
  }

  async update(id: number, updateGrupoDto: UpdateGrupoDto, instructorId: number) {
    // Verificar que el grupo pertenece al instructor
    const grupo = await this.findOne(id, instructorId);

    return await this.prisma.grupo.update({
      where: { id },
      data: {
        nombre: updateGrupoDto.nombre ?? grupo.nombre,
        descripcion: updateGrupoDto.descripcion ?? grupo.descripcion,
      },
    });
  }

  async remove(id: number, instructorId: number) {
    // Verificar que el grupo pertenece al instructor
    await this.findOne(id, instructorId);

    return await this.prisma.grupo.delete({
      where: { id },
    });
  }

  // ===== GESTIÓN DE ALUMNOS EN GRUPOS =====

  async createAlumno(grupoId: number, createAlumnoDto: CreateGrupoAlumnoDto, instructorId: number) {
    // Verificar que el grupo pertenece al instructor
    await this.findOne(grupoId, instructorId);

    // Crear alumno vinculado al instructor
    const alumno = await this.prisma.alumno.create({
      data: {
        nombre: createAlumnoDto.nombre,
        apellidoPaterno: createAlumnoDto.apellidoPaterno,
        apellidoMaterno: createAlumnoDto.apellidoMaterno,
        telefono: createAlumnoDto.telefono,
        curp: createAlumnoDto.curp,
        instructorId,
      },
    });

    // Agregar alumno al grupo
    await this.prisma.grupoAlumno.create({
      data: {
        grupoId,
        alumnoId: alumno.id,
      },
    });

    return alumno;
  }

  async findAlumnosByGrupo(grupoId: number, instructorId: number) {
    // Verificar que el grupo pertenece al instructor
    await this.findOne(grupoId, instructorId);

    const grupoAlumnos = await this.prisma.grupoAlumno.findMany({
      where: { grupoId },
      include: {
        alumno: true,
      },
      orderBy: { creadoEn: 'desc' },
    });

    return grupoAlumnos.map(ga => ga.alumno);
  }

  async removeAlumnoFromGrupo(grupoId: number, alumnoId: number, instructorId: number) {
    // Verificar que el grupo pertenece al instructor
    await this.findOne(grupoId, instructorId);

    // Verificar que el alumno pertenece al instructor
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId },
    });

    if (!alumno || alumno.instructorId !== instructorId) {
      throw new ForbiddenException('No tienes permisos para eliminar este alumno');
    }

    // Remover alumno del grupo
    await this.prisma.grupoAlumno.deleteMany({
      where: {
        grupoId,
        alumnoId,
      },
    });

    return { message: 'Alumno removido del grupo' };
  }

  async updateAlumno(grupoId: number, alumnoId: number, updateData: any, instructorId: number) {
    // Verificar que el grupo pertenece al instructor
    await this.findOne(grupoId, instructorId);

    // Verificar que el alumno pertenece al instructor
    const alumno = await this.prisma.alumno.findUnique({
      where: { id: alumnoId },
    });

    if (!alumno || alumno.instructorId !== instructorId) {
      throw new ForbiddenException('No tienes permisos para actualizar este alumno');
    }

    return await this.prisma.alumno.update({
      where: { id: alumnoId },
      data: updateData,
    });
  }
}

