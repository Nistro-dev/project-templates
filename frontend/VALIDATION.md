# Validation Frontend - Documentation

## Vue d'ensemble

Tous les formulaires de l'application utilisent maintenant **React Hook Form** avec **Zod** pour une validation complète côté client.

## Architecture

### Schémas de validation (`src/schemas/`)

#### `auth.ts`
Contient tous les schémas d'authentification :
- `loginSchema` - Connexion
- `registerSchema` - Inscription avec validation avancée du mot de passe
- `forgotPasswordSchema` - Demande de réinitialisation
- `resetPasswordSchema` - Réinitialisation du mot de passe
- `updateProfileSchema` - Mise à jour du profil
- `changePasswordSchema` - Changement de mot de passe

#### `file.ts`
- `fileUploadSchema` - Validation des fichiers uploadés (taille, type)

### Composants UI

#### `FormField` (`src/components/ui/form-field.tsx`)
Composant réutilisable qui encapsule :
- Label avec indicateur requis (*)
- Input avec gestion d'état
- Message d'erreur en rouge
- Message d'aide optionnel
- État disabled pendant le chargement
- Border rouge en cas d'erreur
- Accessibilité ARIA

## Formulaires implémentés

### 1. Login (`src/pages/Login.tsx`)
**Champs validés :**
- Email : requis, format email valide
- Mot de passe : requis
- Remember me : optionnel

**Gestion d'erreurs API :**
- 401 : "Email ou mot de passe incorrect"
- 403 : "Votre compte a été désactivé"
- 429 : "Trop de tentatives"

**Features :**
- Validation onBlur
- Désactivation du bouton pendant submit
- Loading state avec spinner

### 2. Register (`src/pages/Register.tsx`)
**Champs validés :**
- Email : requis, format valide, max 255 caractères
- Prénom/Nom : requis, max 50 caractères, caractères valides uniquement
- Mot de passe : 
  - Min 8 caractères, max 72
  - Au moins une majuscule
  - Au moins une minuscule
  - Au moins un chiffre
- Confirmation mot de passe : doit correspondre
- Acceptation des CGU : requis

**Gestion d'erreurs API :**
- 400 : "Données invalides"
- 409 : "Email déjà utilisé"
- 429 : "Trop de tentatives"

**Features :**
- Validation onBlur
- Indicateur de force du mot de passe (Faible/Moyen/Fort)
- Barre de progression colorée

### 3. ForgotPassword (`src/pages/ForgotPassword.tsx`)
**Champs validés :**
- Email : requis, format valide

**Gestion d'erreurs API :**
- 404 : Message de succès (sécurité - pas d'indication si email existe)
- 429 : "Trop de tentatives"

**Features :**
- Page de succès avec message de confirmation
- Redirection vers login après succès

### 4. ResetPassword (`src/pages/ResetPassword.tsx`)
**Champs validés :**
- Token : récupéré depuis URL
- Nouveau mot de passe : mêmes règles que Register
- Confirmation : doit correspondre

**Gestion d'erreurs API :**
- 400 : "Lien expiré ou invalide"
- 404 : "Lien invalide"

**Features :**
- Vérification du token dans l'URL
- Indicateur de force du mot de passe
- Auto-redirection vers login après succès (3s)

### 5. Profile (`src/pages/Profile.tsx`)
**Deux formulaires distincts :**

#### Mise à jour du profil
- Prénom/Nom : optionnels, max 50 caractères
- Email : optionnel, format valide, max 255 caractères

**Gestion d'erreurs API :**
- 400 : "Données invalides"
- 409 : "Email déjà utilisé"

#### Changement de mot de passe
- Mot de passe actuel : requis
- Nouveau mot de passe : règles complètes
- Confirmation : doit correspondre
- Validation : nouveau != ancien

**Gestion d'erreurs API :**
- 401 : "Mot de passe actuel incorrect"
- 400 : "Données invalides"

**Features :**
- Deux formulaires indépendants
- Toast de succès
- Reset du formulaire après changement de mot de passe

### 6. Dashboard - FileUpload (`src/components/FileUpload.tsx`)
**Validation :**
- Fichier non vide
- Taille max : 10MB (configurable)
- Types de fichiers acceptés (optionnel)

**Gestion d'erreurs :**
- Affichage inline sous le composant
- Message d'erreur avec icône
- Border rouge en cas d'erreur

**Features :**
- Drag & drop avec validation
- Click to upload avec validation
- Props configurables (maxSizeMB, acceptedTypes)

## Règles de validation communes

### Email
```typescript
z.string()
  .min(1, "L'email est requis")
  .email("L'email doit être valide")
  .max(255, "L'email ne peut pas dépasser 255 caractères")
```

### Mot de passe
```typescript
z.string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(72, "Le mot de passe ne peut pas dépasser 72 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
```

### Nom/Prénom
```typescript
z.string()
  .min(1, "Le prénom est requis")
  .max(50, "Le prénom ne peut pas dépasser 50 caractères")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom contient des caractères invalides")
```

## Gestion d'erreurs API

Tous les formulaires implémentent une gestion d'erreurs cohérente :

```typescript
catch (err: unknown) {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
    const status = axiosError.response?.status
    const message = axiosError.response?.data?.message

    if (status === 400) {
      setError(message || 'Données invalides')
    } else if (status === 401) {
      setError('Non autorisé')
    }
    // etc.
  }
}
```

### Codes d'erreur HTTP gérés
- **400** : Données invalides (validation backend)
- **401** : Non authentifié / Identifiants incorrects
- **403** : Accès interdit / Compte désactivé
- **404** : Ressource non trouvée
- **409** : Conflit (email déjà utilisé)
- **429** : Trop de requêtes

## Features UX

### Validation en temps réel
- Mode `onBlur` sur tous les formulaires
- Feedback immédiat après que l'utilisateur quitte un champ
- Pas de validation pendant la saisie (moins intrusif)

### États visuels
- Border rouge sur les champs en erreur
- Message d'erreur rouge sous chaque champ
- Loading spinner sur les boutons pendant submit
- Bouton désactivé si formulaire invalide ou en cours de submit

### Accessibilité
- Labels associés aux inputs
- Messages d'erreur avec `role="alert"`
- Attributs ARIA (`aria-invalid`, `aria-describedby`)
- Support clavier complet

### Indicateur de force du mot de passe
Utilisé dans Register, ResetPassword, et Profile :
- Calcul basé sur longueur, majuscules, minuscules, chiffres, caractères spéciaux
- 3 niveaux : Faible (rouge), Moyen (jaune), Fort (vert)
- Barre de progression animée

## Services API

Nouveaux endpoints ajoutés dans `src/services/auth.ts` :
- `forgotPassword(email)`
- `resetPassword(token, password)`
- `updateProfile(data)`
- `changePassword(currentPassword, newPassword)`

## Routes ajoutées

Dans `src/App.tsx` :
- `/forgot-password` - Demande de réinitialisation
- `/reset-password` - Réinitialisation (avec token dans l'URL)
- `/profile` - Gestion du profil (protégée)

## Messages en français

Tous les messages de validation et d'erreur sont en français :
- Messages de validation Zod
- Messages d'erreur API
- Messages de succès dans les toasts
- Labels et placeholders

## Tests recommandés

### Tests unitaires à ajouter
1. Validation des schémas Zod
2. Composant FormField
3. Gestion d'erreurs dans chaque formulaire

### Tests E2E à ajouter
1. Flux complet d'inscription
2. Flux de connexion avec erreurs
3. Flux de réinitialisation de mot de passe
4. Mise à jour du profil
5. Upload de fichier avec validation

## Migration depuis l'ancien code

Si vous aviez des formulaires sans validation :
1. Importer le schéma depuis `@/schemas`
2. Ajouter `mode: 'onBlur'` dans useForm
3. Utiliser `formState.isSubmitting` pour le loading state
4. Implémenter la gestion d'erreurs API typée
5. Remplacer les inputs basiques par des inputs avec error prop

## Maintenance

### Ajouter une nouvelle règle de validation
1. Modifier le schéma dans `src/schemas/`
2. Le message d'erreur sera automatiquement affiché

### Ajouter un nouveau formulaire
1. Créer le schéma dans `src/schemas/`
2. Utiliser useForm avec zodResolver
3. Utiliser le composant Input avec la prop error
4. Implémenter la gestion d'erreurs API

### Changer les messages
Tous les messages sont dans les schémas Zod - un seul endroit à modifier.
