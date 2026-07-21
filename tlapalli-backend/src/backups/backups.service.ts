import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

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

  constructor() {
    // Asegurar que el directorio backups exista
    if (!fs.existsSync(this.backupsDir)) {
      fs.mkdirSync(this.backupsDir, { recursive: true });
    }
  }

  // Generar un nuevo respaldo de la base de datos
  async generateBackup(): Promise<BackupFile> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new InternalServerErrorException('La variable DATABASE_URL no está configurada');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tlapalli_backup_${timestamp}.sql.gz`;
    const filePath = path.join(this.backupsDir, filename);

    // En Windows se usa powershell o cmd para la tubería pg_dump | gzip o script
    const command = process.platform === 'win32'
      ? `powershell -Command "& { pg_dump '$databaseUrl' | gzip > '$filePath' }"`
      : `pg_dump "${databaseUrl}" | gzip > "${filePath}"`;

    try {
      this.logger.log(`Generando respaldo de BD: ${filename}...`);
      await execAsync(command, { maxBuffer: 1024 * 1024 * 50 }); // 50MB buffer

      if (!fs.existsSync(filePath)) {
        throw new Error('El archivo de respaldo no se creó correctamente');
      }

      const stats = fs.statSync(filePath);
      this.logger.log(`✅ Respaldo generado con éxito: ${filename} (${stats.size} bytes)`);

      return {
        filename,
        sizeBytes: stats.size,
        sizeFormatted: this.formatBytes(stats.size),
        createdAt: stats.birthtime || stats.mtime,
      };
    } catch (error: any) {
      this.logger.error(`Error generando respaldo: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `No se pudo generar el respaldo. Asegúrate de tener pg_dump y gzip instalados. Error: ${error.message}`,
      );
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
      if (file.endsWith('.sql.gz') || file.endsWith('.sql')) {
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
          // Ignorar archivos que no se puedan leer
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
