import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { RolesGuard } from '../auth/strategies/roles.guard';
import { Roles } from '../auth/strategies/roles.decorator';
import { BackupsService } from './backups.service';

@Controller('backups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  // Generar un nuevo respaldo manualmente
  @Post('generate')
  generateBackup() {
    return this.backupsService.generateBackup();
  }

  // Obtener la lista de todos los respaldos disponibles
  @Get()
  getBackupsList() {
    return this.backupsService.getBackupsList();
  }

  // Descargar un archivo de respaldo específico
  @Get('download/:filename')
  downloadBackup(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const filePath = this.backupsService.getBackupFilePath(filename);
    const fileStream = fs.createReadStream(filePath);

    res.set({
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(fileStream);
  }

  // Eliminar un respaldo específico
  @Delete(':filename')
  deleteBackup(@Param('filename') filename: string) {
    return this.backupsService.deleteBackup(filename);
  }
}
