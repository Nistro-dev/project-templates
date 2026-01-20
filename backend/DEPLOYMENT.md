# Guide de Déploiement et Maintenance

## Sauvegardes de la Base de Données

### Sauvegarde Manuelle

Pour effectuer une sauvegarde manuelle de la base de données :

```bash
./scripts/backup-db.sh [environment]
```

- `environment` : `dev` ou `prod` (défaut: `prod`)

Les sauvegardes sont stockées dans `/backups/postgres/` et sont conservées pendant 30 jours.

### Sauvegarde Automatique avec Cron

Pour configurer une sauvegarde automatique quotidienne, ajoutez cette ligne à votre crontab :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour une sauvegarde quotidienne à 2h du matin
0 2 * * * cd /path/to/project && ./backend/scripts/backup-db.sh prod >> /var/log/backup-db.log 2>&1
```

### Restauration d'une Sauvegarde

Pour restaurer une sauvegarde :

```bash
# Lister les sauvegardes disponibles
ls -lh /backups/postgres/

# Restaurer une sauvegarde spécifique
gunzip < /backups/postgres/backup_prod_YYYYMMDD_HHMMSS.sql.gz | docker exec -i ${PROJECT_NAME}_db_prod psql -U ${DB_USER}
```

## Rollback de Déploiement

En cas de problème après un déploiement, vous pouvez revenir à une version précédente.

### Lister les Versions Disponibles

```bash
docker images ${PROJECT_NAME}_backend_prod --format "table {{.Tag}}\t{{.CreatedAt}}"
docker images ${PROJECT_NAME}_frontend_prod --format "table {{.Tag}}\t{{.CreatedAt}}"
```

### Effectuer un Rollback

```bash
# Remplacer <previous_tag> par le tag de la version souhaitée (ex: 20260120_143000 ou abc1234)
docker tag ${PROJECT_NAME}_backend_prod:<previous_tag> ${PROJECT_NAME}_backend_prod:latest
docker tag ${PROJECT_NAME}_frontend_prod:<previous_tag> ${PROJECT_NAME}_frontend_prod:latest

# Redémarrer avec la version précédente
docker compose -f docker-compose.prod.yml up -d
```

### Rollback avec la Base de Données

Si le rollback nécessite également de restaurer la base de données :

```bash
# 1. Faire une sauvegarde de l'état actuel (au cas où)
./scripts/backup-db.sh prod

# 2. Restaurer la sauvegarde précédente
gunzip < /backups/postgres/backup_prod_YYYYMMDD_HHMMSS.sql.gz | docker exec -i ${PROJECT_NAME}_db_prod psql -U ${DB_USER}

# 3. Rollback les images Docker (voir ci-dessus)
```

## Migrations de Base de Données

### En Production

Les migrations sont automatiquement appliquées lors du déploiement via le script de build.

Pour appliquer manuellement :

```bash
docker exec -it ${PROJECT_NAME}_backend_prod npm run db:migrate:prod
```

### Rollback d'une Migration

Prisma ne supporte pas nativement le rollback de migrations. Pour revenir en arrière :

1. Restaurer une sauvegarde de base de données
2. Ou créer une nouvelle migration qui inverse les changements

## Monitoring et Logs

### Voir les Logs

```bash
# Backend
docker logs -f ${PROJECT_NAME}_backend_prod

# Frontend
docker logs -f ${PROJECT_NAME}_frontend_prod

# Base de données
docker logs -f ${PROJECT_NAME}_db_prod

# Redis
docker logs -f ${PROJECT_NAME}_redis_prod
```

### Santé des Services

```bash
# Vérifier l'état de tous les services
docker compose -f docker-compose.prod.yml ps

# Healthcheck du backend
curl https://api.yourdomain.com/health
```

## Redis

### Connexion à Redis

```bash
docker exec -it ${PROJECT_NAME}_redis_prod redis-cli -a ${REDIS_PASSWORD}
```

### Commandes Utiles Redis

```bash
# Voir tous les refresh tokens
KEYS refresh_token:*

# Nombre de clés
DBSIZE

# Vider le cache (ATTENTION: supprime tous les tokens actifs)
FLUSHDB
```

## Maintenance

### Nettoyage des Images Docker

```bash
# Nettoyer les images non utilisées
docker image prune -f

# Nettoyer tout (images, volumes, réseaux)
docker system prune -a --volumes
```

### Vérifier l'Espace Disque

```bash
# Espace utilisé par Docker
docker system df

# Espace disque du serveur
df -h
```

## Dépannage

### Le Backend ne Démarre Pas

1. Vérifier les logs : `docker logs ${PROJECT_NAME}_backend_prod`
2. Vérifier les variables d'environnement
3. Vérifier que PostgreSQL et Redis sont accessibles

### Problèmes de Connexion à la Base de Données

```bash
# Tester la connexion
docker exec -it ${PROJECT_NAME}_db_prod psql -U ${DB_USER} -d ${DB_NAME}

# Vérifier que le service est en santé
docker compose -f docker-compose.prod.yml ps
```

### Problèmes de Sessions (Redis)

```bash
# Redémarrer Redis
docker restart ${PROJECT_NAME}_redis_prod

# Vérifier les logs Redis
docker logs ${PROJECT_NAME}_redis_prod
```
