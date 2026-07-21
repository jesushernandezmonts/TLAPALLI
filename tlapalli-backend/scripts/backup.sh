#!/bin/bash

# ==============================================================================
# Script de Respaldos de Base de Datos - TLAPALLI (PostgreSQL)
# ==============================================================================

# Cargar variables de entorno si existe el archivo .env
if [ -f "../.env" ]; then
  export $(grep -v '^#' ../.env | xargs)
elif [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: La variable DATABASE_URL no está definida."
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/tlapalli_backup_${TIMESTAMP}.sql.gz"

# Crear directorio de respaldos si no existe
mkdir -p "$BACKUP_DIR"

echo "📦 Iniciando respaldo de la base de datos PostgreSQL..."
echo "📅 Archivo objetivo: $BACKUP_FILE"

# Generar dump de PostgreSQL comprimido con gzip
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Respaldo completado con éxito. Tamaño: $SIZE"
  
  # Limpieza de respaldos locales antiguos (mayores a 30 días)
  echo "🧹 Eliminando respaldos mayores a 30 días..."
  find "$BACKUP_DIR" -type f -name "tlapalli_backup_*.sql.gz" -mtime +30 -delete
  echo "✨ Proceso finalizado."
else
  echo "❌ Error durante la generación del respaldo."
  exit 1
fi
