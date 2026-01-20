# 📦 Guide d'Utilisation des Composants UI

## Table des Matières
1. [Button](#button)
2. [Input](#input)
3. [Card](#card)
4. [Avatar](#avatar)
5. [Checkbox](#checkbox)
6. [Loading](#loading)
7. [DropdownMenu](#dropdownmenu)
8. [FileUpload](#fileupload)

---

## Button

### Import
```tsx
import { Button } from '@/components/ui/button'
```

### Variants Disponibles

#### 1. Default (Primary)
```tsx
<Button>
  Se connecter
</Button>
```
Gradient indigo/violet, glow au hover, scale 1.05

#### 2. Secondary
```tsx
<Button variant="secondary">
  Créer un compte
</Button>
```
Gradient rose/rouge, glow rose au hover

#### 3. Outline
```tsx
<Button variant="outline">
  Annuler
</Button>
```
Bordure primary, rempli au hover

#### 4. Ghost
```tsx
<Button variant="ghost">
  Retour
</Button>
```
Transparent, background léger au hover

#### 5. Destructive
```tsx
<Button variant="destructive">
  Supprimer
</Button>
```
Rouge, pour actions dangereuses

#### 6. Success
```tsx
<Button variant="success">
  Valider
</Button>
```
Gradient bleu/cyan

#### 7. Glass
```tsx
<Button variant="glass">
  Action
</Button>
```
Effet glassmorphism

### Tailles

```tsx
<Button size="sm">Petit</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grand</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">🔍</Button>
```

### Avec Icône

```tsx
import { ArrowRight } from 'lucide-react'

<Button>
  <span className="flex items-center gap-2">
    Continuer
    <ArrowRight className="w-4 h-4" />
  </span>
</Button>
```

### État Loading

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Chargement...
    </span>
  ) : (
    'Envoyer'
  )}
</Button>
```

### Exemples Complets

```tsx
// Button de connexion avec animation
<Button className="w-full group" size="lg">
  <span className="flex items-center gap-2">
    Se connecter
    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
  </span>
</Button>

// Button d'action secondaire
<Button variant="outline" size="default">
  Annuler
</Button>

// Button icon seul
<Button variant="ghost" size="icon">
  <Settings className="w-4 h-4" />
</Button>
```

---

## Input

### Import
```tsx
import { Input } from '@/components/ui/input'
```

### Input Basique

```tsx
<Input
  type="text"
  placeholder="Entrez du texte"
/>
```

### Avec Icône

```tsx
import { Mail } from 'lucide-react'

<Input
  type="email"
  placeholder="vous@exemple.com"
  icon={<Mail className="w-4 h-4" />}
/>
```

### Avec État d'Erreur

```tsx
<Input
  type="email"
  placeholder="vous@exemple.com"
  error="Email invalide"
/>
```

### Password avec Toggle

```tsx
// Automatique si type="password"
<Input
  type="password"
  placeholder="••••••••"
/>
```

### Avec React Hook Form

```tsx
import { useForm } from 'react-hook-form'
import { Mail, Lock } from 'lucide-react'

const { register, formState: { errors } } = useForm()

<Input
  type="email"
  placeholder="vous@exemple.com"
  icon={<Mail className="w-4 h-4" />}
  error={errors.email?.message}
  {...register('email')}
/>

<Input
  type="password"
  placeholder="••••••••"
  icon={<Lock className="w-4 h-4" />}
  error={errors.password?.message}
  {...register('password')}
/>
```

### Exemple Complet avec Label

```tsx
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
    Adresse email
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="vous@exemple.com"
    icon={<Mail className="w-4 h-4" />}
    error={errors.email?.message}
    {...register('email')}
  />
</div>
```

---

## Card

### Import
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
```

### Card Standard

```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre de la Card</CardTitle>
    <CardDescription>Description optionnelle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu de la card...</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Card avec Glassmorphism

```tsx
<Card glass>
  <CardHeader>
    <CardTitle>Card Translucide</CardTitle>
  </CardHeader>
  <CardContent>
    Effet de verre avec backdrop-blur
  </CardContent>
</Card>
```

### Card avec Hover Effect

```tsx
<Card hover>
  <CardContent className="p-6">
    Cette card se lève au survol
  </CardContent>
</Card>
```

### Stats Card (Dashboard)

```tsx
import { FileText } from 'lucide-react'

<Card hover className="animate-fade-in-up">
  <CardContent className="p-6">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
        <FileText className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600 font-medium">Total fichiers</p>
        <p className="text-2xl font-bold text-gray-900">42</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### File Card (Dashboard)

```tsx
<div className="group flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary-50/50 transition-all duration-300 hover-lift">
  <div className="flex items-center gap-4 flex-1 min-w-0">
    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
      <FileText className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 truncate">document.pdf</p>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>2.5 MB</span>
        <span>•</span>
        <span>15 janv. 2026</span>
      </div>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="icon">
      <Download className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

## Avatar

### Import
```tsx
import { Avatar } from '@/components/ui/avatar'
```

### Avatar Basique

```tsx
<Avatar fallback="Jean Dupont" />
```
Affiche "JD" (initiales) avec gradient de fond

### Avatar avec Image

```tsx
<Avatar
  src="/path/to/image.jpg"
  alt="Jean Dupont"
  fallback="Jean Dupont"
/>
```
Affiche l'image, ou initiales si erreur de chargement

### Tailles

```tsx
<Avatar fallback="JD" size="sm" />   {/* 32px */}
<Avatar fallback="JD" size="md" />   {/* 40px - défaut */}
<Avatar fallback="JD" size="lg" />   {/* 48px */}
<Avatar fallback="JD" size="xl" />   {/* 64px */}
```

### Avec Custom Class

```tsx
<Avatar
  fallback="Jean Dupont"
  className="ring-2 ring-primary ring-offset-2"
/>
```

### Exemple dans Header

```tsx
const user = { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' }

<button className="flex items-center gap-3">
  <div className="text-right">
    <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
    <p className="text-xs text-gray-500">{user.email}</p>
  </div>
  <Avatar fallback={`${user.firstName} ${user.lastName}`} size="md" />
</button>
```

---

## Checkbox

### Import
```tsx
import { Checkbox } from '@/components/ui/checkbox'
```

### Checkbox Simple

```tsx
<Checkbox label="Se souvenir de moi" />
```

### Checkbox sans Label

```tsx
<Checkbox />
```

### Avec React Hook Form

```tsx
<Checkbox
  id="acceptTerms"
  label="J'accepte les conditions"
  {...register('acceptTerms')}
/>
```

### Label avec ReactNode

```tsx
<Checkbox
  id="acceptTerms"
  label={
    <span className="text-sm text-gray-600">
      J'accepte les{' '}
      <Link to="/terms" className="text-primary hover:text-primary-600 font-medium">
        conditions d'utilisation
      </Link>
    </span>
  }
  {...register('acceptTerms')}
/>
```

### Avec Message d'Erreur

```tsx
<div>
  <Checkbox
    id="acceptTerms"
    label="J'accepte les conditions"
    {...register('acceptTerms')}
  />
  {errors.acceptTerms && (
    <p className="text-xs text-destructive font-medium mt-1 ml-7">
      {errors.acceptTerms.message}
    </p>
  )}
</div>
```

---

## Loading

### Import
```tsx
import { Loading, LoadingOverlay } from '@/components/ui/loading'
```

### Spinner Simple

```tsx
<Loading />
```

### Avec Taille

```tsx
<Loading size="sm" />   {/* 16px */}
<Loading size="md" />   {/* 32px - défaut */}
<Loading size="lg" />   {/* 48px */}
<Loading size="xl" />   {/* 64px */}
```

### Avec Texte

```tsx
<Loading size="lg" text="Chargement des fichiers..." />
```

### Overlay Full Screen

```tsx
{isLoading && <LoadingOverlay text="Chargement en cours..." />}
```

### Dans un Container

```tsx
{isLoading ? (
  <div className="py-12">
    <Loading size="lg" text="Chargement..." />
  </div>
) : (
  <div>Contenu chargé</div>
)}
```

### Custom Color

```tsx
<Loading className="border-secondary" />
```

---

## DropdownMenu

### Import
```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
```

### Menu Basique

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Action 1</DropdownMenuItem>
    <DropdownMenuItem>Action 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Avec Label et Séparateurs

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profil</DropdownMenuItem>
    <DropdownMenuItem>Paramètres</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Déconnexion</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Avec Icônes

```tsx
import { User, Settings, LogOut } from 'lucide-react'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      <span>Profil</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      <span>Paramètres</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Déconnexion</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Menu Utilisateur (Dashboard)

```tsx
import { Avatar } from '@/components/ui/avatar'

const user = { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' }

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-4 py-2 transition-all">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      <Avatar fallback={`${user.firstName} ${user.lastName}`} />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      <span>Profil</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      <span>Paramètres</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={logout} className="text-destructive">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Déconnexion</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## FileUpload

### Import
```tsx
import { FileUpload } from '@/components/FileUpload'
```

### Usage Basique

```tsx
const handleUpload = async (file: File) => {
  // Votre logique d'upload
  await uploadFile(file)
}

<FileUpload onUpload={handleUpload} />
```

### Avec État Loading

```tsx
const [isUploading, setIsUploading] = useState(false)

const handleUpload = async (file: File) => {
  setIsUploading(true)
  try {
    await uploadFile(file)
  } finally {
    setIsUploading(false)
  }
}

<FileUpload onUpload={handleUpload} isUploading={isUploading} />
```

### Exemple Complet

```tsx
import { FileUpload } from '@/components/FileUpload'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'

const MyComponent = () => {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await fileService.upload(file)
      toast({
        title: 'Succès',
        description: 'Fichier téléchargé avec succès',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec du téléchargement',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Télécharger un fichier</CardTitle>
        <CardDescription>Glissez-déposez ou cliquez pour sélectionner</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload onUpload={handleUpload} isUploading={isUploading} />
      </CardContent>
    </Card>
  )
}
```

---

## 🎨 Exemples de Combinaisons

### Formulaire de Connexion Complet

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Mail, Lock, ArrowRight } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  remember: z.boolean().optional(),
})

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    // Votre logique de connexion
    setIsLoading(false)
  }

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Accédez à votre espace</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          <Checkbox
            label="Se souvenir de moi"
            {...register('remember')}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Connexion...' : (
              <span className="flex items-center gap-2">
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
```

### Header avec Menu Utilisateur

```tsx
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut } from 'lucide-react'

export const DashboardHeader = ({ user, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Tableau de bord
        </h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-4 py-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Avatar fallback={`${user.firstName} ${user.lastName}`} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

---

## 🎯 Tips & Best Practices

### 1. Accessibilité
```tsx
// ✅ Toujours associer Label et Input
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// ✅ ARIA labels pour les boutons icon
<Button variant="ghost" size="icon" aria-label="Supprimer">
  <Trash2 className="w-4 h-4" />
</Button>
```

### 2. États de Chargement
```tsx
// ✅ Désactiver le bouton et afficher un spinner
<Button disabled={isLoading}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <Spinner />
      Chargement...
    </span>
  ) : (
    'Envoyer'
  )}
</Button>
```

### 3. Validation de Formulaire
```tsx
// ✅ Utiliser react-hook-form + zod
const schema = z.object({
  email: z.string().email('Email invalide'),
})

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})

<Input
  error={errors.email?.message}
  {...register('email')}
/>
```

### 4. Responsive Design
```tsx
// ✅ Cacher du texte sur mobile
<div className="text-right hidden sm:block">
  <p>{user.name}</p>
</div>

// ✅ Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
```

---

**Créé par Claude Code** - Guide d'Utilisation des Composants
