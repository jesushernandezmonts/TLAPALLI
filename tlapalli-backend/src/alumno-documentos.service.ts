import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { Express } from 'express';

@Injectable()
export class AlumnoDocumentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private async getAlumnoOrFail(alumnoId: number) {
    const alumno = await this.prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    return alumno;
  }

  private async removePreviousDocumento(alumnoId: number, tipo: string) {
    const prev = await this.prisma.documento.findFirst({
      where: { alumnoId, tipo },
      orderBy: { subidoEn: 'desc' },
    });
    if (prev) {
      const publicId = this.cloudinary.extractPublicIdFromUrl(prev.url);
      if (publicId) await this.cloudinary.deleteFile(publicId);
      await this.prisma.documento.delete({ where: { id: prev.id } });
    }
  }

  private async uploadDocumento(alumnoId: number, file: Express.Multer.File, tipo: string) {
    if (!file) throw new BadRequestException('No se recibió el archivo');
    await this.getAlumnoOrFail(alumnoId);
    await this.removePreviousDocumento(alumnoId, tipo);

    const uploaded = await this.cloudinary.uploadFile(file, `alumnos_documentos/${alumnoId}`);
    const documento = await this.prisma.documento.create({
      data: {
        nombre: file.originalname,
        tipo,
        url: uploaded.secureUrl,
        alumnoId,
      },
    });

    return {
      message: 'Documento subido correctamente',
      documento,
      tipo,
      url: uploaded.secureUrl,
    };
  }

  async getMisDocumentos(alumnoId: number) {
    await this.getAlumnoOrFail(alumnoId);
    const documentos = await this.prisma.documento.findMany({
      where: {
        alumnoId,
        tipo: { in: ['curp', 'comprobante_domicilio', 'foto_infantil'] },
      },
      orderBy: { subidoEn: 'desc' },
    });

    const latestByType = (tipo: string) => documentos.find((d) => d.tipo === tipo) || null;

    return {
      curp: latestByType('curp'),
      domicilio: latestByType('comprobante_domicilio'),
      fotoInfantil: latestByType('foto_infantil'),
      completos:
        Boolean(latestByType('curp')) &&
        Boolean(latestByType('comprobante_domicilio')) &&
        Boolean(latestByType('foto_infantil')),
    };
  }

  async uploadCurp(alumnoId: number, file: Express.Multer.File) {
    return this.uploadDocumento(alumnoId, file, 'curp');
  }

  async uploadDomicilio(alumnoId: number, file: Express.Multer.File) {
    return this.uploadDocumento(alumnoId, file, 'comprobante_domicilio');
  }

  async uploadFotoInfantil(alumnoId: number, file: Express.Multer.File) {
    return this.uploadDocumento(alumnoId, file, 'foto_infantil');
  }
}
