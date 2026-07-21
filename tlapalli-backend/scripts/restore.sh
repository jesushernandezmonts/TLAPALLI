#!/bin/bash

# ==============================================================================
# Script de Restauración de Base de Datos - TLAPALLI (PostgreSQL)
# ==============================================================================

if [ -z "$1" ]; then
  echo "❌ Uso: ./restore.sh <ruta-al-archivo-backup.sql.gz>"
  echo "Ejemplo: ./restore.sh ./backups/tlapalli_backup_20260721_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: El archivo '$BACKUP_FILE' no existe."
  exit 1
fi

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

echo "⚠️ ADVERTENCIA: Esta operación sobrescribirá los datos en la base de datos."
read -p "¿Estás seguro de que deseas continuar? (s/N): " CONFIRM
if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
  echo "Operación cancelada."
  exit 0
fi

echo "🔄 Restaurando base de datos desde $BACKUP_FILE..."

# Descomprimir y ejecutar script SQL en PostgreSQL
gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"

if [ $? -eq 0 ]; then
  echo "✅ Base de datos restaurada correctamente."
else
  echo "❌ Error durante la restauración de la base de datos."
  exit 1
fi
