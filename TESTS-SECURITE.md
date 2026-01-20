# 🧪 Guide des Tests de Sécurité

## Exécution des tests

### 1. Tests automatisés

```bash
# Backend - Tous les tests de sécurité
cd backend
npm test security.test.ts

# Avec coverage
npm test security.test.ts -- --coverage

# Mode watch
npm test security.test.ts -- --watch
```

### 2. Tests manuels

#### Test XSS
```bash
# Tenter d'injecter script dans email
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "<script>alert(\"xss\")</script>@example.com",
    "password": "Password123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Résultat attendu : 400 Bad Request avec erreur validation
```

#### Test SQL Injection
```bash
# Email avec SQL injection
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin'\''--@example.com",
    "password": "password"
  }'

# Résultat attendu : 400 Bad Request
```

#### Test Rate Limiting
```bash
# Script pour tester rate limit login
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword"
    }'
  echo "\nAttempt $i"
done

# Résultat attendu : 
# - Tentatives 1-5 : 401 Unauthorized
# - Tentative 6+ : 429 Too Many Requests
```

#### Test File Upload - Extension dangereuse
```bash
# Créer un fichier .exe
echo "malware" > malware.exe

# Tenter upload
curl -X POST http://localhost:3000/api/v1/files/upload \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "file=@malware.exe"

# Résultat attendu : 400 Bad Request (extension non autorisée)
```

#### Test Path Traversal
```bash
# Tenter accès fichier via path traversal
curl -X GET "http://localhost:3000/api/v1/files/../../etc/passwd/download" \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# Résultat attendu : 400 Bad Request ou 404 Not Found
```

#### Test Authorization
```bash
# Tenter accès à /me sans token
curl -X GET http://localhost:3000/api/v1/auth/me

# Résultat attendu : 401 Unauthorized

# Avec token invalide
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer fake-token-123"

# Résultat attendu : 401 Unauthorized
```

### 3. Tests de performance

#### Rate Limit - Mesure précise
```bash
# Installer hey (load testing)
# macOS: brew install hey
# Linux: go get -u github.com/rakyll/hey

# Test rate limit
hey -n 100 -c 10 -m POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}' \
  http://localhost:3000/api/v1/auth/login

# Analyser les 429 responses
```

### 4. Tests Postman/Insomnia

Collection Postman disponible : `postman/security-tests.json`

**Tests inclus** :
- ✅ XSS injection attempts
- ✅ SQL injection attempts
- ✅ Password validation
- ✅ Rate limiting
- ✅ File upload security
- ✅ Authorization checks

Import dans Postman → Run Collection

---

## Checklist de sécurité manuelle

### Avant déploiement

- [ ] Exécuter `npm audit` (0 vulnérabilités critiques/hautes)
- [ ] Tests de sécurité passent (100%)
- [ ] Variables d'environnement vérifiées
- [ ] Secrets générés aléatoirement (min 32 chars)
- [ ] HTTPS activé (production)
- [ ] Rate limiting configuré
- [ ] Logs ne contiennent pas de données sensibles
- [ ] Error messages génériques en production

### Tests exploratoires

- [ ] Tenter login avec SQL injection
- [ ] Tenter XSS dans tous les champs
- [ ] Vérifier rate limits sur toutes les routes
- [ ] Uploader fichiers malveillants (.exe, .sh)
- [ ] Tenter accès ressources autres utilisateurs
- [ ] Vérifier headers de sécurité (Helmet)
- [ ] Tester path traversal
- [ ] Vérifier CORS (uniquement frontend autorisé)

---

## Résultats attendus

Tous les tests doivent **échouer** (c'est bon signe !) :

| Test | Résultat attendu |
|------|------------------|
| XSS injection | ❌ 400 Bad Request |
| SQL injection | ❌ 400 Bad Request |
| Password faible | ❌ 400 Bad Request |
| Upload .exe | ❌ 400 Bad Request |
| Path traversal | ❌ 400/404 |
| Brute force (6e tentative) | ❌ 429 Too Many Requests |
| Accès sans token | ❌ 401 Unauthorized |
| Token invalide | ❌ 401 Unauthorized |
| Accès ressource autre user | ❌ 404 Not Found |

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/security.yml
name: Security Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run security tests
        run: |
          cd backend
          npm test security.test.ts
      
      - name: NPM Audit
        run: |
          cd backend
          npm audit --audit-level=moderate
      
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
```

### Pre-commit hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run security tests before commit
cd backend && npm test security.test.ts

# Check for hardcoded secrets
if git diff --cached | grep -iE "(password|secret|token)\s*=\s*['\"]"; then
  echo "❌ Possible hardcoded secret detected!"
  exit 1
fi
```

---

## Reporting

### Format de rapport de bug sécurité

```markdown
## Titre
[SECURITY] Description courte

## Criticité
- [ ] Critique (CVSS 9.0-10.0)
- [ ] Haute (CVSS 7.0-8.9)
- [ ] Moyenne (CVSS 4.0-6.9)
- [ ] Basse (CVSS 0.1-3.9)

## Description
Explication détaillée de la vulnérabilité

## Steps to Reproduce
1. Étape 1
2. Étape 2
3. ...

## Proof of Concept
```bash
curl -X POST ...
```

## Impact
Que peut faire un attaquant ?

## Remediation
Comment corriger ?

## References
- OWASP Top 10
- CWE-XX
```

---

## Resources

- Tests automatisés : `backend/src/__tests__/security.test.ts`
- Documentation : `backend/SECURITY.md`
- Rapport d'audit : `SECURITY-AUDIT-REPORT.md`
- Résumé : `AUDIT-SECURITE-RESUME.md`
