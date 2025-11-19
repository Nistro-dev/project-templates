# Tests

Ce projet inclut des tests unitaires et d'intégration pour le frontend et le backend.

## Backend

### Exécuter les tests

```bash
cd backend
pnpm test
```

### Exécuter les tests avec couverture

```bash
pnpm test:coverage
```

### Structure des tests

- `src/utils/__tests__/` - Tests pour les utilitaires (password, JWT, logger)
- `src/__tests__/models/` - Tests pour les modèles Prisma

### Exemples de tests

- **Password utils** : Hachage et vérification des mots de passe
- **JWT utils** : Génération et vérification des tokens
- **User model** : CRUD opérations sur le modèle User

## Frontend

### Exécuter les tests

```bash
cd frontend
pnpm test
```

### Exécuter les tests avec couverture

```bash
pnpm test:coverage
```

### Structure des tests

- `src/components/ui/__tests__/` - Tests pour les composants UI (Button, Input, Card)
- `src/hooks/__tests__/` - Tests pour les hooks personnalisés (useAuth)
- `src/store/__tests__/` - Tests pour les stores Zustand (auth)
- `src/lib/__tests__/` - Tests pour les utilitaires (cn)

### Configuration

- **Vitest** : Framework de test
- **Testing Library** : Pour tester les composants React
- **jsdom** : Environnement DOM pour les tests

### Exemples de tests

- **Composants UI** : Rendu, interactions utilisateur, variants
- **Hooks** : Login, register, logout
- **Store** : État d'authentification
- **Utils** : Fusion de classes CSS

## CI/CD

Les tests sont automatiquement exécutés dans GitHub Actions sur les branches `main` et `develop` :

- Tests backend avec PostgreSQL
- Tests frontend avec lint
- Couverture de code minimale de 70%

Voir `.github/workflows/test.yml` pour plus de détails.