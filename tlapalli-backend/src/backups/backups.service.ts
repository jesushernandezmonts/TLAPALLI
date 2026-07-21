import { Injectable, InternalServerErrorException, NotFoundException, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';

const execAsync = promisify(exec);

export interface BackupFile {
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: Date;
}

@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);
  private readonly backupsDir = path.join(process.cwd(), 'backups');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  // Generar un nuevo respaldo de la base de datos (pg_dump con fallback nativo Prisma)
  async generateBackup(): Promise<BackupFile> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const databaseUrl = process.env.DATABASE_URL;

    // 1. Intentar con pg_dump si está instalado en el servidor
    if (databaseUrl) {
      try {
        const filename = `tlapalli_backup_${timestamp}.sql.gz`;
        const filePath = path.join(this.backupsDir, filename);

        const command = process.platform === 'win32'
          ? `powershell -Command "& { pg_dump '$databaseUrl' | gzip > '$filePath' }"`
          : `pg_dump "${databaseUrl}" | gzip > "${filePath}"`;

        await execAsync(command, { maxBuffer: 1024 * 1024 * 50 });

        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
          const stats = fs.statSync(filePath);
          this.logger.log(`✅ Respaldo pg_dump generado: ${filename} (${stats.size} bytes)`);
          return {
            filename,
            sizeBytes: stats.size,
            sizeFormatted: this.formatBytes(stats.size),
            createdAt: stats.birthtime || stats.mtime,
          };
        }
      } catch (err: any) {
        this.logger.warn(`pg_dump no disponible (${err.message}). Ejecutando respaldo nativo via Prisma Client...`);
      }
    }

    // 2. Fallback nativo: Exportación completa de datos via Prisma Client
    try {
      const filename = `tlapalli_backup_${timestamp}.json.gz`;
      const filePath = path.join(this.backupsDir, filename);

      const [
        usuarios, alumnos, documentos, talleres, instructores, inscripciones,
        asistencias, pagos, actividades, reportes, grupos, grupoAlumnos,
        servicioSocial, actividadesServicioSocial, justificaciones
      ] = await Promise.all([
        this.prisma.usuario.findMany(),
        this.prisma.alumno.findMany(),
        this.prisma.documento.findMany(),
        this.prisma.taller.findMany(),
        this.prisma.instructor.findMany(),
        this.prisma.inscripcion.findMany(),
        this.prisma.asistencia.findMany(),
        this.prisma.pago.findMany(),
        this.prisma.actividad.findMany(),
        this.prisma.reporte.findMany(),
        this.prisma.grupo.findMany(),
        this.prisma.grupoAlumno.findMany(),
        this.prisma.servicioSocial.findMany(),
        this.prisma.actividadServicioSocial.findMany(),
        this.prisma.justificacionInstructor.findMany(),
      ]);

      const dumpData = {
        metadata: {
          app: 'TLAPALLI - Centro Cultural',
          createdAt: new Date().toISOString(),
          totalRecords:
            usuarios.length + alumnos.length + documentos.length + talleres.length +
            instructores.length + inscripciones.length + asistencias.length + pagos.length +
            actividades.length + reportes.length + grupos.length + grupoAlumnos.length +
            servicioSocial.length + actividadesServicioSocial.length + justificaciones.length,
        },
        data: {
          usuarios, alumnos, documentos, talleres, instructores, inscripciones,
          asistencias, pagos, actividades, reportes, grupos, grupoAlumnos,
          servicioSocial, actividadesServicioSocial, justificaciones,
        },
      };

      const compressed = zlib.gzipSync(JSON.stringify(dumpData, null, 2));
      fs.writeFileSync(filePath, compressed);

      const stats = fs.statSync(filePath);
      this.logger.log(`✅ Respaldo nativo Prisma generado: ${filename} (${stats.size} bytes)`);

      return {
        filename,
        sizeBytes: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        createdAt: stats.birthtime || stats.mtime,
      };
    } catch (error: any) {
      this.logger.error(`Error generando respaldo nativo: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`No se pudo generar el respaldo de la base de datos: ${error.message}`);
    }
  }

  // Obtener la lista de todos los respaldos existentes
  async getBackupsList(): Promise<BackupFile[]> {
    if (!fs.existsSync(this.backupsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupsDir);
    const backupFiles: BackupFile[] = [];

    for (const file of files) {
      if (file.endsWith('.sql.gz') || file.endsWith('.json.gz') || file.endsWith('.sql')) {
        const filePath = path.join(this.backupsDir, file);
        try {
          const stats = fs.statSync(filePath);
          backupFiles.push({
            filename: file,
            sizeBytes: stats.size,
            sizeFormatted: this.formatBytes(stats.size),
            createdAt: stats.birthtime || stats.mtime,
          });
        } catch (e) {
          // Ignorar archivos no legibles
        }
      }
    }

    return backupFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Obtener la ruta absoluta segura de un archivo de respaldo para su descarga
  getBackupFilePath(filename: string): string {
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.backupsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`El archivo de respaldo '${safeFilename}' no existe`);
    }

    return filePath;
  }

  // Eliminar un archivo de respaldo específico
  async deleteBackup(filename: string): Promise<{ message: string }> {
    const safeFilename = path.basename(filename);
    const filePath = path.join(this.backupsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`El archivo de respaldo '${safeFilename}' no existe`);
    }

    try {
      fs.unlinkSync(filePath);
      this.logger.log(`🗑️ Respaldo eliminado: ${safeFilename}`);
      return { message: `Respaldo '${safeFilename}' eliminado correctamente` };
    } catch (error: any) {
      throw new InternalServerErrorException(`No se pudo eliminar el respaldo: ${error.message}`);
    }
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
