# 🗄️ Guía de Respaldos y Restauración - TLAPALLI

Este documento describe la estrategia de respaldo y restauración de la base de datos PostgreSQL del Centro Cultural Tlapalli.

---

## 📋 Requisitos Previos

Para ejecutar los scripts de respaldo y restauración se requiere:
1. Herramientas de cliente de PostgreSQL (`pg_dump` y `psql`) instaladas en el sistema.
2. `gzip` y `gunzip` disponibles en el entorno de línea de comandos.
3. Variable de entorno `DATABASE_URL` configurada en el archivo `.env` del backend.

---

## 📦 1. Respaldo Manual

Para generar un respaldo comprimido de la base de datos de manera inmediata:

```bash
cd tlapalli-backend
chmod +x scripts/backup.sh
./scripts/backup.sh
```

El respaldo se guardará en el directorio `./backups/` con la nomenclatura:
`tlapalli_backup_YYYYMMDD_HHMMSS.sql.gz`

El script eliminará automáticamente cualquier archivo de respaldo en `./backups/` que tenga más de 30 días de antigüedad.

---

## 🔄 2. Restauración de Base de Datos

Para restaurar la base de datos desde un archivo `.sql.gz`:

```bash
cd tlapalli-backend
chmod +x scripts/restore.sh
./scripts/restore.sh ./backups/tlapalli_backup_20260721_120000.sql.gz
```

> ⚠️ **Atención**: La restauración reemplazará o actualizará los registros de la base de datos destino según las instrucciones del SQL dump.

---

## ⏰ 3. Automatización con Cron Job (Servidor Linux)

Para programar un respaldo automático diario a las 3:00 AM en el servidor:

1. Abrir la tabla cron:
   ```bash
   crontab -e
   ```

2. Agregar la siguiente línea (ajustando la ruta absoluta del proyecto):
   ```cron
   0 3 * * * /bin/bash /ruta/al/proyecto/tlapalli-backend/scripts/backup.sh >> /var/log/tlapalli_backup.log 2>&1
   ```

---

## ☁️ 4. Copia en Almacenamiento Nube (Recomendado para Producción)

Se recomienda sincronizar la carpeta `./backups/` con un servicio de almacenamiento en la nube (AWS S3, Google Cloud Storage, Cloudinary o Supabase Storage).

Ejemplo utilizando `aws-cli`:
```bash
aws s3 sync ./backups/ s3://tu-bucket-tlapalli-backups/ --delete
```
