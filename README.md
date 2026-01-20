# Template Projet SaaS Full-Stack

Template moderne et prêt pour la production pour créer des applications SaaS avec authentification, upload de fichiers, et déploiement automatisé.

## Stack Technique

### Backend
- **Fastify** - Framework web rapide et léger
- **Prisma** - ORM TypeScript moderne
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification stateless avec access/refresh tokens
- **MinIO/S3** - Stockage d'objets
- **Pino** - Logging structuré haute performance
- **Zod** - Validation de schémas TypeScript

### Frontend
- **React 18** - Library UI moderne
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **React Router** - Routing côté client
- **Zustand** - Gestion d'état légère
- **Radix UI** - Composants accessibles
- **Tailwind CSS** - Styling utility-first
- **React Hook Form** - Gestion de formulaires performante

### DevOps
- **Docker & Docker Compose** - Conteneurisation
- **Traefik** - Reverse proxy avec SSL automatique
- **GitHub Actions** - CI/CD automatisé
- **Vitest** - Framework de test moderne

## Fonctionnalités

- Authentification complète (inscription, connexion, refresh tokens)
- Upload et gestion de fichiers via S3/MinIO
- Routes protégées avec middleware d'authentification
- Gestion d'erreurs robuste avec classes personnalisées
- Health checks pour tous les services
- Logging structuré en développement et production
- Tests unitaires et d'intégration
- Déploiement automatique avec rollback
- SSL/TLS automatique via Let's Encrypt
- Rate limiting et sécurité (Helmet, CORS, CSRF)

## Prérequis

- **Node.js** 20+
- **Docker** & **Docker Compose**
- **pnpm** (recommandé) ou **npm**

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-org/projet-template.git mon-projet
cd mon-projet
```

### 2. Configuration backend

```bash
cd backend
cp .env.example .env
```

Éditer `backend/.env` :

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb

JWT_ACCESS_SECRET=your_access_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
COOKIE_SECRET=your_cookie_secret_here_min_32_chars

S3_ENDPOINT=http://localhost:9000
S3_BUCKET=files
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```

### 3. Configuration frontend

```bash
cd ../frontend
cp .env.example .env
```

Éditer `frontend/.env` :

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Configuration Docker Compose

```bash
cd ..
cp .env.example .env
```

Éditer `.env` à la racine :

```env
PROJECT_NAME=monprojet
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_fort
DB_NAME=monprojet
FRONTEND_DOMAIN=monprojet.com
API_DOMAIN=api.monprojet.com
```

## Démarrage en développement

### Option 1 : Docker Compose (recommandé)

```bash
docker compose up -d
```

- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- API Health : http://localhost:3000/health

### Option 2 : Local

**Backend** (terminal 1) :

```bash
cd backend
pnpm install
pnpm db:migrate
pnpm dev
```

**Frontend** (terminal 2) :

```bash
cd frontend
pnpm install
pnpm dev
```

## Scripts disponibles

### Backend

```bash
pnpm dev              # Développement avec hot-reload
pnpm build            # Build pour production
pnpm start            # Démarre le build de production
pnpm db:generate      # Génère le client Prisma
pnpm db:migrate       # Exécute les migrations en dev
pnpm db:migrate:prod  # Exécute les migrations en prod
pnpm db:studio        # Interface Prisma Studio
pnpm db:seed          # Seed la base de données
pnpm test             # Lance les tests
pnpm test:coverage    # Tests avec couverture de code
pnpm lint             # Lint le code
pnpm format           # Formate le code
```

### Frontend

```bash
pnpm dev              # Développement avec hot-reload
pnpm build            # Build pour production
pnpm preview          # Preview du build de production
pnpm test             # Lance les tests
pnpm test:coverage    # Tests avec couverture de code
pnpm lint             # Lint le code
```

## Structure du projet

```
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Migrations DB
│   │   ├── schema.prisma     # Schéma Prisma
│   │   └── seed.ts           # Données de test
│   ├── src/
│   │   ├── config/           # Configuration (env)
│   │   ├── controllers/      # Logique des routes
│   │   ├── middlewares/      # Middlewares (auth, errors)
│   │   ├── routes/           # Définition des routes
│   │   ├── schemas/          # Schémas Zod de validation
│   │   ├── services/         # Logique métier
│   │   ├── utils/            # Utilitaires (logger, erreurs, jwt, s3)
│   │   └── server.ts         # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── lib/              # Utilitaires
│   │   ├── pages/            # Pages principales
│   │   ├── App.tsx           # Composant racine
│   │   └── main.tsx          # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       ├── test.yml          # CI tests
│       ├── deploy-dev.yml    # Déploiement dev
│       └── deploy-prod.yml   # Déploiement prod
├── docker-compose.yml        # Dev
├── docker-compose.dev.yml    # Dev détaillé
├── docker-compose.prod.yml   # Production
└── README.md
```

## API Endpoints

### Authentification

```
POST   /api/auth/register     # Inscription
POST   /api/auth/login        # Connexion
POST   /api/auth/refresh      # Rafraîchir le token
POST   /api/auth/logout       # Déconnexion
POST   /api/auth/logout-all   # Déconnexion tous appareils
```

### Fichiers (protégé)

```
POST   /api/files/upload      # Upload un fichier
GET    /api/files             # Liste des fichiers
GET    /api/files/:id/url     # URL de téléchargement
DELETE /api/files/:id         # Supprimer un fichier
```

## Déploiement en production

### 1. Configurer les secrets GitHub

Dans votre repo GitHub, ajoutez ces secrets :

- `SERVER_HOST` - IP ou domaine de votre serveur
- `SERVER_USER` - Utilisateur SSH (ex: debian)
- `SSH_PRIVATE_KEY` - Clé privée SSH
- `PROD_PATH` - Chemin du projet sur le serveur

### 2. Préparer le serveur

```bash
# Installer Docker et Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Créer le network Traefik
docker network create web

# Cloner le projet
git clone https://github.com/votre-org/projet-template.git /home/debian/mon-projet
cd /home/debian/mon-projet
```

### 3. Configurer les variables d'environnement

Créer `backend/.env` et `.env` avec les vraies valeurs de production.

### 4. Déployer

Push sur la branche `main` déclenche automatiquement le déploiement via GitHub Actions.

```bash
git push origin main
```

Le workflow :
1. Lance les tests
2. Se connecte au serveur via SSH
3. Pull les dernières modifications
4. Rebuild et redémarre les containers
5. Nettoie les images inutilisées

## Tests

### Backend

```bash
cd backend
pnpm test
```

### Frontend

```bash
cd frontend
pnpm test
```

## Sécurité

- Mots de passe hashés avec **bcrypt**
- Tokens JWT avec expiration
- Rate limiting global (100 req/min)
- Protection CSRF
- Helmet pour sécuriser les headers HTTP
- CORS configuré
- Variables sensibles dans `.env` (jamais committed)
- Health checks pour détecter les services défaillants

## Troubleshooting

### Le backend ne démarre pas

Vérifier que PostgreSQL est bien démarré :

```bash
docker compose ps
docker compose logs db
```

### Erreur de migration Prisma

Réinitialiser la base :

```bash
docker compose down -v
docker compose up -d db
cd backend && pnpm db:migrate
```

### CORS errors

Vérifier que `FRONTEND_URL` dans `backend/.env` correspond à l'URL du frontend.

### MinIO inaccessible

Vérifier la configuration S3 dans `backend/.env` et que MinIO est démarré.

## Licence

MIT

## Support

Pour toute question, ouvrir une issue sur GitHub.
