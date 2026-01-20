# 🎨 Guide de Design - Frontend Moderne

## 🌈 Palette de Couleurs

### Couleurs Principales

#### Primary (Indigo)
```
50:  #eef2ff  ░░░░░░░░  Très clair
100: #e0e7ff  ░░░░░░░   
200: #c7d2fe  ░░░░░░    
300: #a5b4fc  ░░░░░     
400: #818cf8  ░░░░      
500: #6366f1  ███████   <- Couleur principale
600: #4f46e5  ██████    
700: #4338ca  █████     
800: #3730a3  ████      
900: #312e81  ███       Très foncé
```

#### Secondary (Violet)
```
500: #a855f7  ███████   <- Couleur secondaire
600: #9333ea  ██████    
```

#### Accent (Rose/Pink)
```
500: #d946ef  ███████   <- Couleur accent
600: #c026d3  ██████    
```

#### Success (Vert)
```
500: #10b981  ███████   <- Succès
```

#### Warning (Orange)
```
500: #f59e0b  ███████   <- Avertissement
```

#### Destructive (Rouge)
```
500: #ef4444  ███████   <- Danger/Erreur
```

---

## 🎭 Gradients Premium

### 1. Primary Gradient
```
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

[Indigo Clair] ──────────────> [Violet]
     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```
**Utilisation** : Buttons primaires, badges, backgrounds

### 2. Secondary Gradient
```
linear-gradient(135deg, #f093fb 0%, #f5576c 100%)

[Rose Clair] ──────────────> [Rouge Rose]
     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```
**Utilisation** : Buttons secondaires, accents

### 3. Success Gradient
```
linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)

[Bleu] ──────────────> [Cyan]
     ░░░░░░░░░░░░░░░░░░░░░░░
```
**Utilisation** : Messages de succès, stats positives

### 4. Premium Gradient (3 couleurs)
```
linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)

[Indigo] ──> [Violet] ──> [Rose]
     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```
**Utilisation** : Backgrounds de pages (Login, Register)

---

## 🪟 Effet Glassmorphism

### Recette du Glassmorphism parfait

```css
.glass {
  background: rgba(255, 255, 255, 0.1);  /* Blanc 10% */
  backdrop-filter: blur(16px);           /* Flou d'arrière-plan */
  border: 1px solid rgba(255, 255, 255, 0.2);  /* Bordure translucide */
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);  /* Ombre douce */
}
```

**Rendu visuel :**
```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  <- Contenu flou visible
│ ░ Contenu de la card ░░░░░░░░░ │     à travers
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░                             ░ │
│ ░ [Button]                    ░ │
└─────────────────────────────────┘
  ↑ Bordure blanche translucide
```

**Exemples d'utilisation :**
- Cards de Login/Register
- Header du Dashboard (sticky)
- Modals et popovers
- Dropdowns

---

## ✨ Animations

### 1. Fade In
```
Opacité: 0% ──────────────> 100%
         invisible          visible
```
**Durée** : 500ms
**Utilisation** : Apparition de contenus

### 2. Fade In Up
```
Position Y: +20px ──────────> 0px
Opacité:    0%    ──────────> 100%
            ↓                  ↑
         en bas             normal
```
**Durée** : 600ms
**Utilisation** : Cards, sections au scroll

### 3. Scale In
```
Scale:    0.95  ──────────> 1.0
Opacité:  0%    ──────────> 100%
          petit            normal
```
**Durée** : 300ms
**Utilisation** : Modals, dropdowns, cards

### 4. Float (Infini)
```
Position Y:  0px ──> -10px ──> 0px ──> -10px ──> ...
             ↑       ↓        ↑       ↓
          normal   haut    normal   haut
```
**Durée** : 3s (infini)
**Utilisation** : Bulles de background animées

### 5. Hover Lift
```
Au survol:
Position Y: 0px ──────────> -4px
            normal          levé
```
**Durée** : 300ms
**Utilisation** : Cards, buttons au hover

### 6. Pulse Glow
```
Shadow: 20px blur 30% opacity ⟷ 30px blur 60% opacity
        petit glow               grand glow
```
**Durée** : 2s (infini)
**Utilisation** : Badges, buttons avec effet glow

---

## 🔤 Typographie

### Fonts
```
Sans (Corps de texte):
  Font: 'Inter', system-ui, sans-serif
  Poids: 300, 400, 500, 600, 700, 800
  
Display (Titres importants):
  Font: 'Poppins', sans-serif
  Poids: 400, 500, 600, 700, 800
  
Mono (Code):
  Font: 'JetBrains Mono', 'Fira Code', monospace
  Poids: 400, 500, 700
```

### Tailles
```
xs:   12px  ───  Très petit texte
sm:   14px  ───  Petit texte
base: 16px  ───  Texte normal (défaut)
lg:   18px  ───  Grand texte
xl:   20px  ───  Très grand
2xl:  24px  ───  Sous-titres
3xl:  30px  ───  Titres
4xl:  36px  ───  Grands titres
5xl:  48px  ───  Titres hero
```

### Hiérarchie Typographique
```
┌─────────────────────────────┐
│  H1: 3xl, bold, display     │  <- Titre principal page
│  H2: 2xl, bold, display     │  <- Titre de section
│  H3: xl, semibold           │  <- Sous-titre
│  Body: base, normal         │  <- Texte normal
│  Small: sm, normal          │  <- Texte secondaire
│  Tiny: xs, normal           │  <- Légendes, labels
└─────────────────────────────┘
```

---

## 🎯 Composants Clés

### Button Variants

#### 1. Default (Primary)
```
┌────────────────────────┐
│ ████████████████████  │  <- Gradient primary
│ █  Se connecter  →  █ │     Texte blanc
│ ████████████████████  │     Shadow glow
└────────────────────────┘
     ↑ Hover: scale(1.05)
```

#### 2. Secondary
```
┌────────────────────────┐
│ ████████████████████  │  <- Gradient secondary (rose)
│ █  Créer compte  →  █ │     Texte blanc
│ ████████████████████  │     Shadow glow-pink
└────────────────────────┘
```

#### 3. Outline
```
┌────────────────────────┐
│ ┌──────────────────────┐│  <- Bordure primary 2px
│ │  Annuler            ││     Texte primary
│ └──────────────────────┘│     Hover: rempli primary
└────────────────────────┘
```

#### 4. Ghost
```
┌────────────────────────┐
│   Retour               │  <- Pas de bordure
└────────────────────────┘     Hover: bg-accent/10
```

#### 5. Glass
```
┌────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░  │  <- Glassmorphism
│ ░  Action  ░░░░░░░░░░ │     Backdrop blur
│ ░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────┘
```

---

### Input States

#### 1. Normal
```
┌──────────────────────────────┐
│ 📧  vous@exemple.com         │
└──────────────────────────────┘
    ↑ Icon à gauche
```

#### 2. Focus
```
┌══════════════════════════════┐  <- Bordure primary (2px)
│ 📧  vous@exemple.com|        │     Ring primary
└══════════════════════════════┘
```

#### 3. Error
```
┌──────────────────────────────┐
│ 📧  vous@exemple.com         │
└──────────────────────────────┘
  ⚠️ Email invalide              <- Message d'erreur rouge
```

#### 4. Password avec Toggle
```
┌──────────────────────────────┐
│ 🔒  ••••••••            👁️  │  <- Icon œil cliquable
└──────────────────────────────┘
```

---

### Card Styles

#### 1. Card Standard
```
┌─────────────────────────────────┐
│  Titre de la Card               │
│  Description                    │
│                                 │
│  Contenu...                     │
│                                 │
│  [Button]                       │
└─────────────────────────────────┘
  Border: 1px, Radius: xl, Shadow: lg
```

#### 2. Card Glass
```
┌─────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░  Titre             ░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░  Contenu           ░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────┘
  Glassmorphism + backdrop-blur
```

#### 3. Card Hover Lift
```
Normal:
┌─────────────────────────────────┐
│  Card                           │
└─────────────────────────────────┘

Hover:
    ↑ -4px
┌─────────────────────────────────┐
│  Card                           │  <- Plus grande shadow
└─────────────────────────────────┘
```

---

### Stats Card (Dashboard)

```
┌───────────────────────┐
│  ┌──────┐            │
│  │ 📄  │  Total fichiers  │  <- Icon dans badge gradient
│  └──────┘  42         │     Nombre grand et bold
└───────────────────────┘
   Hover: lift + shadow-xl
```

---

### File Card (Dashboard)

```
┌─────────────────────────────────────────┐
│  ┌──────┐                               │
│  │ 📄  │  document.pdf                 │  <- Icon gradient
│  └──────┘  2.5 MB • 15 janv. 2026      │     Nom + infos
│                        [⬇️] [🗑️]        │     Actions
└─────────────────────────────────────────┘
   Hover: bordure primary + bg-primary-50
```

---

### Drag & Drop Zone

#### Normal State
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                                      │
│        ┌──────┐                      │
│        │  ⬆️  │                      │  <- Upload icon dans cercle
│        └──────┘                      │
│                                      │
│   Glissez-déposez ou cliquez        │
│   Tous types de fichiers acceptés   │
│                                      │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
  Bordure grise en pointillés
```

#### Dragging State
```
┌━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░      ┌──────┐              ░░░ │
│ ░      │  ⬆️  │  (bounce)    ░░░ │  <- Icon primary avec bounce
│ ░      └──────┘              ░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░ Déposez votre fichier ici ░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘
  Bordure primary, bg-primary-50, scale(1.05)
```

---

### Avatar Component

```
┌──────────┐
│   ░░░░   │  <- Gradient background
│  ░ JD ░  │     Initiales blanches
│   ░░░░   │     Font semibold
└──────────┘
   Rounded-full, Shadow
```

---

### Dropdown Menu

```
Trigger:
┌─────────────────────────────┐
│  JD  Jean Dupont        ▼  │  <- Avatar + nom + chevron
└─────────────────────────────┘

Menu ouvert (scale-in animation):
┌─────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  <- Glassmorphism
│ ░  Mon compte          ░░░░ │
│ ░  ─────────────       ░░░░ │
│ ░  👤 Profil           ░░░░ │  <- Items avec icônes
│ ░  ⚙️ Paramètres       ░░░░ │     Hover: bg-primary-50
│ ░  ─────────────       ░░░░ │
│ ░  🚪 Déconnexion      ░░░░ │  <- Rouge au hover
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────┘
```

---

### Loading Spinner

```
Petit (sm):
  ⟲  (4x4, border-2)

Moyen (md):
  ⟲  (8x8, border-2)

Large (lg):
  ⟲  (12x12, border-3)

Extra Large (xl):
  ⟲  (16x16, border-4)

Avec texte:
  ⟲
  Chargement...
  (texte avec animation pulse)
```

---

### Checkbox

```
Non coché:
┌───┐
│   │  Label du checkbox
└───┘
  Bordure input

Coché:
┌───┐
│ ✓ │  Label du checkbox  <- Check blanc sur fond primary
└───┘
  Fond primary
```

---

## 📐 Spacing & Layout

### Spacing Scale
```
xs:  0.5rem (8px)   ─
sm:  1rem   (16px)  ──
md:  1.5rem (24px)  ───
lg:  2rem   (32px)  ────
xl:  3rem   (48px)  ──────
2xl: 4rem   (64px)  ────────
```

### Container
```
┌────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  <- Padding responsive
│ ░                                      ░░ │
│ ░  Container content                   ░░ │
│ ░  Max-width: 1400px                   ░░ │
│ ░  Center: true                        ░░ │
│ ░                                      ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────┘
```

### Grid Layouts

#### Stats (Dashboard)
```
Mobile (1 col):
┌──────────┐
│  Stat 1  │
└──────────┘
┌──────────┐
│  Stat 2  │
└──────────┘
┌──────────┐
│  Stat 3  │
└──────────┘

Desktop (3 cols):
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Stat 1  │ │  Stat 2  │ │  Stat 3  │
└──────────┘ └──────────┘ └──────────┘
```

---

## 🎨 Exemples de Combinaisons

### Hero Section (Login/Register)
```
Background:
  Gradient premium (indigo → violet → rose)
  + Bulles flottantes animées (float)

Card:
  Glassmorphism (blanc 10%, blur 16px)
  + Shadow-2xl
  + Animation scale-in à l'entrée

Badge Icon:
  Gradient primary (indigo → violet)
  + Shadow-glow
  + Icon blanc

Buttons:
  Gradient primary ou secondary
  + Shadow-glow ou glow-pink
  + Hover: scale(1.05)
```

### Dashboard Header
```
Background:
  Blanc 80% + backdrop-blur
  + Bordure bottom grise
  + Sticky top

Logo Badge:
  Gradient primary + shadow-glow
  + Icon Files blanc

Titre:
  Font Poppins, bold, 2xl
  + Gradient text (primary-600 → primary-800)

Avatar + Dropdown:
  Avatar gradient + initiales
  + Dropdown glassmorphism
  + Items avec hover effects
```

### File List
```
Container:
  Card standard avec header

Empty State:
  Icon large dans cercle gris
  + Textes centrés gris
  + Message d'invitation

File Item:
  Badge gradient + icon FileText
  + Nom bold (hover: text-primary)
  + Infos secondaires (size + date)
  + Actions (download + delete)
  + Hover: bordure primary + bg-primary-50 + lift
  + Animation fade-in avec délai progressif
```

---

## 🌟 Tips & Best Practices

### 1. Cohérence des Gradients
```
✅ Utilisez toujours les mêmes gradients pour les mêmes actions:
   - Primary gradient → Actions principales
   - Secondary gradient → Actions secondaires
   - Success gradient → Stats/feedback positifs

❌ N'utilisez pas de gradients aléatoires
```

### 2. Animations Subtiles
```
✅ Durées courtes (200-500ms) pour les interactions
✅ Easing: cubic-bezier pour des mouvements naturels
✅ Transform + opacity (GPU accelerated)

❌ Pas d'animations trop longues (> 1s)
❌ Pas de width/height animations (performance)
```

### 3. Contraste et Lisibilité
```
✅ Texte foncé sur fond clair
✅ Texte blanc sur gradients foncés
✅ Ratio de contraste WCAG AA minimum (4.5:1)

❌ Texte gris clair sur fond blanc
❌ Texte coloré sur gradient coloré
```

### 4. Responsive Design
```
✅ Mobile first approach
✅ Grid responsive (1 → 2 → 3 cols)
✅ Padding/margin adaptatifs
✅ Textes cachés sur mobile si nécessaire (sm:block)

❌ Layout figé
❌ Texte trop petit sur mobile
```

### 5. Accessibilité
```
✅ Labels sur tous les inputs
✅ ARIA labels sur les icônes
✅ Focus visible (ring primary)
✅ États disabled clairs

❌ Buttons sans label accessible
❌ Contraste insuffisant
```

---

## 🎨 Palette de Couleurs Complète (Référence)

```css
/* Primary (Indigo) */
--primary-50:  #eef2ff;
--primary-100: #e0e7ff;
--primary-200: #c7d2fe;
--primary-300: #a5b4fc;
--primary-400: #818cf8;
--primary-500: #6366f1;  /* Couleur principale */
--primary-600: #4f46e5;
--primary-700: #4338ca;
--primary-800: #3730a3;
--primary-900: #312e81;

/* Secondary (Violet) */
--secondary-50:  #faf5ff;
--secondary-100: #f3e8ff;
--secondary-200: #e9d5ff;
--secondary-300: #d8b4fe;
--secondary-400: #c084fc;
--secondary-500: #a855f7;  /* Couleur principale */
--secondary-600: #9333ea;
--secondary-700: #7e22ce;
--secondary-800: #6b21a8;
--secondary-900: #581c87;

/* Accent (Rose/Pink) */
--accent-50:  #fdf4ff;
--accent-100: #fae8ff;
--accent-200: #f5d0fe;
--accent-300: #f0abfc;
--accent-400: #e879f9;
--accent-500: #d946ef;  /* Couleur principale */
--accent-600: #c026d3;
--accent-700: #a21caf;
--accent-800: #86198f;
--accent-900: #701a75;

/* Success (Vert) */
--success-50:  #ecfdf5;
--success-100: #d1fae5;
--success-500: #10b981;  /* Couleur principale */
--success-600: #059669;

/* Warning (Orange) */
--warning-50:  #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;  /* Couleur principale */
--warning-600: #d97706;

/* Destructive (Rouge) */
--destructive: hsl(0, 84.2%, 60.2%);  /* #ef4444 */
```

---

**Créé par Claude Code** - Guide de Design Frontend
