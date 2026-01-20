# Documentation API v1

Base URL: `/api/v1`

## Authentification

### POST /auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** 201 Created
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "jwt-token",
    "refreshToken": "jwt-token"
  }
}
```

Note: Un email de vérification est envoyé automatiquement.

---

### POST /auth/login
Se connecter avec email et mot de passe.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** 200 OK
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "jwt-token"
}
```

Note: Le refreshToken est stocké dans un cookie httpOnly.

---

### POST /auth/verify-email/:token
Vérifier l'email avec le token reçu par email.

**Params:**
- `token`: Token de vérification

**Response:** 200 OK
```json
{
  "message": "Email vérifié avec succès"
}
```

---

### POST /auth/forgot-password
Demander la réinitialisation du mot de passe.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** 200 OK
```json
{
  "message": "Email envoyé si le compte existe"
}
```

Note: Un email avec un lien de réinitialisation est envoyé si le compte existe.

---

### POST /auth/reset-password
Réinitialiser le mot de passe avec le token reçu par email.

**Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

**Response:** 200 OK
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

Note: Toutes les sessions actives sont déconnectées après la réinitialisation.

---

### POST /auth/refresh
Rafraîchir le token d'accès.

**Cookie:** `refreshToken` (httpOnly)

**Response:** 200 OK
```json
{
  "accessToken": "new-jwt-token"
}
```

---

### POST /auth/logout
Se déconnecter (invalide le refresh token actuel).

**Cookie:** `refreshToken` (httpOnly)

**Response:** 204 No Content

---

### POST /auth/logout-all
Se déconnecter de tous les appareils.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Response:** 204 No Content

---

### GET /auth/me
Récupérer les informations de l'utilisateur connecté.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Profil Utilisateur

### GET /users/profile
Récupérer le profil complet de l'utilisateur.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /users/profile
Mettre à jour le profil.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

---

### PATCH /users/password
Changer le mot de passe.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:** 200 OK
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

---

## Fichiers

### POST /files
Uploader un fichier.

**Headers:**
- `Authorization`: Bearer {accessToken}
- `Content-Type`: multipart/form-data

**Body:**
- `file`: Le fichier à uploader

**Response:** 201 Created
```json
{
  "id": "uuid",
  "filename": "document.pdf",
  "mimeType": "application/pdf",
  "size": 123456,
  "url": "presigned-url",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /files
Lister les fichiers avec pagination.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Query Parameters:**
- `page` (optional): Numéro de page (défaut: 1)
- `limit` (optional): Nombre d'éléments par page (défaut: 10)

**Response:** 200 OK
```json
{
  "files": [
    {
      "id": "uuid",
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 123456,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

---

### GET /files/:id/download
Obtenir une URL de téléchargement signée.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Params:**
- `id`: ID du fichier

**Response:** 200 OK
```json
{
  "url": "presigned-download-url"
}
```

---

### DELETE /files/:id
Supprimer un fichier.

**Headers:**
- `Authorization`: Bearer {accessToken}

**Params:**
- `id`: ID du fichier

**Response:** 204 No Content

---

## Codes d'Erreur

- `400 Bad Request`: Données invalides
- `401 Unauthorized`: Non authentifié
- `403 Forbidden`: Accès refusé
- `404 Not Found`: Ressource introuvable
- `409 Conflict`: Conflit (ex: email déjà utilisé)
- `500 Internal Server Error`: Erreur serveur

**Format des erreurs:**
```json
{
  "error": "Message d'erreur en français"
}
```

**Erreurs de validation:**
```json
{
  "error": "Erreur de validation",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## Sécurité

### CSRF Protection
Toutes les routes POST/PUT/PATCH/DELETE nécessitent un token CSRF.

Le token CSRF est automatiquement géré par `@fastify/csrf-protection`.

### Rate Limiting
- 100 requêtes par minute par IP

### Authentification
- Access Token: Expire après 15 minutes
- Refresh Token: Expire après 7 jours
- Les refresh tokens sont stockés dans Redis pour une invalidation rapide

### Sessions
- Les sessions (refresh tokens) sont stockées dans Redis
- Invalidation possible de toutes les sessions d'un utilisateur
- Historique des sessions conservé en base de données PostgreSQL
