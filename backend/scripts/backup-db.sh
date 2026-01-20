#!/bin/bash

# Script de sauvegarde PostgreSQL
# Usage: ./backup-db.sh [environment]
# Environment: dev ou prod (défaut: prod)

set -e

ENV=${1:-prod}
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${ENV}_${TIMESTAMP}.sql.gz"

# Créer le dossier de backup s'il n'existe pas
mkdir -p ${BACKUP_DIR}

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Variables pour la connexion
DB_CONTAINER="${PROJECT_NAME}_db_${ENV}"
DB_NAME=${DB_NAME:-postgres}
DB_USER=${DB_USER:-postgres}

echo "🔄 Début de la sauvegarde de la base de données..."
echo "Environment: ${ENV}"
echo "Container: ${DB_CONTAINER}"
echo "Database: ${DB_NAME}"

# Effectuer le dump
docker exec -t ${DB_CONTAINER} pg_dumpall -c -U ${DB_USER} | gzip > ${BACKUP_FILE}

# Vérifier que le backup est réussi
if [ -f ${BACKUP_FILE} ]; then
    BACKUP_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
    echo "✅ Sauvegarde réussie: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    echo "❌ Échec de la sauvegarde"
    exit 1
fi

# Nettoyer les anciennes sauvegardes (garder les 30 derniers jours)
echo "🧹 Nettoyage des anciennes sauvegardes..."
find ${BACKUP_DIR} -name "backup_${ENV}_*.sql.gz" -type f -mtime +30 -delete

echo "✅ Processus de sauvegarde terminé"

# Afficher les statistiques
echo ""
echo "📊 Sauvegardes disponibles:"
ls -lh ${BACKUP_DIR}/backup_${ENV}_*.sql.gz | tail -5
