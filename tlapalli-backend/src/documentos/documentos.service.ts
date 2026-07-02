import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import * as fs from 'fs';
import { PDFDocument } from 'pdf-lib';

const execFileAsync = promisify(execFile);

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  async upload(alumnoId: number, nombre: string, tipo: string, url: string) {
    return this.prisma.documento.create({
      data: { nombre, tipo, url, alumnoId },
    });
  }

  async findAllGrouped() {
    const documentos = await this.prisma.documento.findMany({
      orderBy: { subidoEn: 'desc' },
    });
    // Agrupar por alumnoId
    const grouped: Record<number, typeof documentos> = {};
    for (const doc of documentos) {
      if (!grouped[doc.alumnoId]) {
        grouped[doc.alumnoId] = [];
      }
      grouped[doc.alumnoId].push(doc);
    }
    return grouped;
  }

  findByAlumno(alumnoId: number) {
    return this.prisma.documento.findMany({
      where: { alumnoId },
      orderBy: { subidoEn: 'desc' },
    });
  }

  async remove(id: number) {
    const doc = await this.prisma.documento.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    // Intentar borrar el archivo de Cloudinary
    try {
      const publicId = doc.url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)?.[1];
      if (publicId) {
        // Cloudinary no lanza error si el archivo no existe
        await import('cloudinary').then(({ v2: cloudinary }) => {
          // La configuración se toma del módulo global
          return cloudinary.uploader.destroy(publicId);
        });
      }
    } catch (e) {
      console.error('No se pudo borrar el archivo de Cloudinary:', e);
    }

    return this.prisma.documento.delete({ where: { id } });
  }

  async scanDocument(useDialog: boolean): Promise<Buffer> {
    const tempDir = join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const tempImagePath = join(tempDir, `scan-${uniqueId}.png`);

    // Intentar encontrar el script en la carpeta de compilación o en la de origen
    let scriptPath = join(__dirname, 'scripts', 'scan.ps1');
    if (!fs.existsSync(scriptPath)) {
      scriptPath = join(process.cwd(), 'src', 'documentos', 'scripts', 'scan.ps1');
    }

    if (!fs.existsSync(scriptPath)) {
      throw new InternalServerErrorException('No se pudo encontrar el script de escaneo.');
    }

    try {
      // Argumentos para PowerShell
      const args = [
        '-ExecutionPolicy', 'Bypass',
        '-File', scriptPath,
        '-outputPath', tempImagePath,
        '-useDialog', useDialog ? 'true' : 'false'
      ];

      // Ejecutar PowerShell
      try {
        await execFileAsync('powershell.exe', args);
      } catch (err: any) {
        const stderrStr = err.stderr || err.message || '';
        const lowerStderr = stderrStr.toLowerCase();
        
        if (lowerStderr.includes('no se detectó') || lowerStderr.includes('no se detecto') || lowerStderr.includes('no scanner') || lowerStderr.includes('0x80210015')) {
          throw new NotFoundException('No se detectó ningún escáner conectado. Por favor, verifica la conexión.');
        }
        if (lowerStderr.includes('cancelado') || lowerStderr.includes('canceló') || lowerStderr.includes('cancelo') || lowerStderr.includes('cancel') || lowerStderr.includes('0x80210064')) {
          throw new NotFoundException('El usuario canceló el escaneo.');
        }
        throw new InternalServerErrorException('Error al escanear: ' + stderrStr);
      }

      // Validar si el archivo PNG fue creado
      if (!fs.existsSync(tempImagePath)) {
        throw new InternalServerErrorException('El escáner no generó la imagen.');
      }

      // Convertir PNG a PDF usando pdf-lib
      const pdfDoc = await PDFDocument.create();
      const imageBytes = fs.readFileSync(tempImagePath);
      
      const pngImage = await pdfDoc.embedPng(imageBytes);
      const { width, height } = pngImage.scale(1.0);
      
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width,
        height,
      });

      const pdfBytes = await pdfDoc.save();
      
      // Limpiar archivo temporal PNG
      try {
        fs.unlinkSync(tempImagePath);
      } catch (e) {}

      return Buffer.from(pdfBytes);
    } catch (err) {
      // Limpiar archivos temporales en caso de fallo
      try {
        if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
      } catch (e) {}

      if (err instanceof NotFoundException || err instanceof InternalServerErrorException) {
        throw err;
      }
      throw new InternalServerErrorException('Fallo en el proceso de escaneo: ' + (err as Error).message);
    }
  }
}

