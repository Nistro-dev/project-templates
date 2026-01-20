# Changelog Backend

## [2.0.0] - 2026-01-20

### Ajouts Majeurs

#### Priority 2
- **CSRF Protection**: Ajout de `@fastify/csrf-protection` pour protéger contre les attaques CSRF
- **Email Verification**: 
  - Champs `emailVerified` et `emailVerificationToken` ajoutés au modèle User
  - Service d'envoi d'email de vérification
  - Route POST `/api/v1/auth/verify-email/:token`
- **Password Reset**:
  - Champs `passwordResetToken` et `passwordResetExpires` ajoutés au modèle User
  - Route POST `/api/v1/auth/forgot-password`
  - Route POST `/api/v1/auth/reset-password`
  - Envoi automatique d'emails de réinitialisation
- **Logging amélioré**: Warnings pour les erreurs de validation dans errorHandler

#### Priority 3
- **Gestion du Profil Utilisateur**:
  - GET `/api/v1/users/profile` - Récupérer le profil
  - PATCH `/api/v1/users/profile` - Mettre à jour firstName/lastName
  - PATCH `/api/v1/users/password` - Changer le mot de passe
- **Pagination des Fichiers**:
  - Paramètres `page` et `limit` ajoutés à GET `/api/v1/files`
  - Retour avec `{ files, total, page, totalPages }`
- **Versioning API**:
  - Toutes les routes déplacées sous `/api/v1`
  - Structure `/routes/v1/` créée
  - Facilite les futures versions de l'API

#### Priority 4
- **Redis pour Sessions**:
  - Service Redis ajouté dans docker-compose (dev + prod)
  - Dépendance `ioredis` ajoutée
  - Client Redis créé dans `utils/redis.ts`
  - Refresh tokens stockés dans Redis (sessions actives)
  - Historique des tokens conservé en PostgreSQL
  - Invalidation rapide des sessions
- **Scripts de Backup**:
  - Script `scripts/backup-db.sh` pour sauvegarder PostgreSQL
  - Support dev/prod
  - Nettoyage automatique des backups > 30 jours
  - Documentation pour cron jobs
- **Rollback de Déploiement**:
  - Workflow GitHub Actions modifié
  - Tag automatique des images Docker avant déploiement
  - Conservation des 3 dernières versions
  - Documentation complète du processus de rollback

### Fichiers Créés

#### Services
- `backend/src/services/email.service.ts` - Service d'envoi d'emails (vérification, reset password)
- `backend/src/services/user.service.ts` - Gestion du profil utilisateur

#### Controllers
- `backend/src/controllers/user.controller.ts` - Endpoints profil utilisateur

#### Routes
- `backend/src/routes/v1/index.ts` - Router principal v1
- `backend/src/routes/v1/auth.routes.ts` - Routes authentification v1
- `backend/src/routes/v1/file.routes.ts` - Routes fichiers v1
- `backend/src/routes/v1/user.routes.ts` - Routes utilisateur v1

#### Utils
- `backend/src/utils/redis.ts` - Client Redis et fonctions utilitaires

#### Scripts
- `backend/scripts/backup-db.sh` - Script de sauvegarde PostgreSQL

#### Documentation
- `backend/.env.example` - Template des variables d'environnement
- `backend/API.md` - Documentation complète de l'API v1
- `backend/DEPLOYMENT.md` - Guide de déploiement et maintenance
- `CHANGELOG.md` - Ce fichier

#### Migrations
- `backend/prisma/migrations/20260120000000_add_email_verification_and_password_reset/migration.sql`

### Fichiers Modifiés

#### Configuration
- `backend/package.json` - Ajout de `@fastify/csrf-protection`, `ioredis`
- `backend/prisma/schema.prisma` - Nouveaux champs User (emailVerified, emailVerificationToken, passwordResetToken, passwordResetExpires)
- `backend/src/config/env.ts` - Ajout variable REDIS_URL
- `docker-compose.prod.yml` - Service Redis ajouté
- `docker-compose.dev.yml` - Service Redis ajouté

#### Server & Middlewares
- `backend/src/server.ts` - Configuration CSRF
- `backend/src/middlewares/errorHandler.ts` - Logging warnings pour validation (déjà présent)

#### Services
- `backend/src/services/auth.service.ts`:
  - Génération et envoi du token de vérification email lors du register
  - Fonction `verifyEmail()`
  - Fonction `forgotPassword()`
  - Fonction `resetPassword()`
  - Utilisation de Redis pour les refresh tokens
  - Invalidation via Redis
- `backend/src/services/file.service.ts`:
  - Pagination ajoutée à `list()`
  - Retour `PaginatedFileList` au lieu de `FileListItem[]`

#### Controllers
- `backend/src/controllers/auth.controller.ts`:
  - `verifyEmail()`
  - `forgotPassword()`
  - `resetPassword()`
- `backend/src/controllers/file.controller.ts`:
  - Support pagination dans `list()`

#### Routes
- `backend/src/routes/index.ts` - Utilise maintenant `/api/v1`
- `backend/src/routes/auth.routes.ts` - Routes verify-email, forgot-password, reset-password

#### Exports
- `backend/src/services/index.ts` - Export userService, emailService
- `backend/src/controllers/index.ts` - Export userController

#### Schemas
- `backend/src/schemas/auth.ts`:
  - `forgotPasswordSchema`
  - `resetPasswordSchema`
  - `updateProfileSchema`
  - `changePasswordSchema`

#### CI/CD
- `.github/workflows/deploy-prod.yml`:
  - Tag des images Docker avant déploiement
  - Conservation des 3 dernières versions
  - Instructions de rollback dans les logs

### Breaking Changes

⚠️ **IMPORTANT**: Toutes les routes API ont été déplacées de `/api/*` vers `/api/v1/*`

Migration nécessaire:
- `/api/auth/*` → `/api/v1/auth/*`
- `/api/files/*` → `/api/v1/files/*`
- Nouvelles routes: `/api/v1/users/*`

### Variables d'Environnement Ajoutées

```bash
REDIS_URL=redis://:password@localhost:6379/0
```

### Migration Base de Données

```bash
npx prisma migrate deploy
```

Ou appliquer manuellement:
```sql
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailVerificationToken" TEXT,
ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetExpires" TIMESTAMP(3);
```

### Notes de Déploiement

1. **Mettre à jour les variables d'environnement** avec `REDIS_URL`
2. **Démarrer Redis** via docker-compose
3. **Appliquer les migrations** Prisma
4. **Installer les nouvelles dépendances** (`npm install`)
5. **Mettre à jour le frontend** pour utiliser `/api/v1` au lieu de `/api`

### Sécurité

- CSRF Protection activée sur toutes les routes mutantes
- Tokens de vérification email générés avec crypto.randomBytes (256 bits)
- Tokens de reset password expiration: 1 heure
- Refresh tokens stockés dans Redis avec TTL automatique
- Invalidation rapide des sessions compromises
- Rate limiting maintenu (100 req/min)

### Performance

- Redis pour les sessions = lookup O(1) au lieu de requête PostgreSQL
- Pagination des fichiers réduit la charge mémoire
- Cleanup automatique des anciennes sauvegardes

### Observability

- Logging structuré avec Pino (déjà présent)
- Logs de toutes les opérations critiques (register, login, password reset, etc.)
- Healthcheck endpoint: `/health`
