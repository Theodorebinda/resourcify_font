# Documentation : Gestion du Thème

## Vue d'ensemble

Le système de thème de Ressourcefy permet aux utilisateurs de basculer entre trois modes :
- **Système** (par défaut) : Suit automatiquement les préférences système
- **Clair** : Force le mode clair
- **Sombre** : Force le mode sombre

Le thème est une **préférence UI locale**, complètement découplée de l'authentification :
- ✅ Fonctionne pour les visiteurs et les utilisateurs authentifiés
- ✅ Persisté dans `localStorage` (pas sur le backend)
- ✅ Aucune dépendance avec l'état d'authentification

---

## Architecture

### Fichiers impliqués

```
src/
├── stores/
│   └── use-ui-store.ts          # Store Zustand pour l'état du thème
├── providers/
│   └── theme-provider.tsx       # Provider React qui applique le thème
├── components/
│   └── shared/
│       └── theme-selector.tsx    # Composant UI pour changer le thème
├── app/
│   ├── layout.tsx                # Intégration du ThemeProvider
│   └── globals.css               # Variables CSS pour light/dark
└── tailwind.config.ts            # Configuration Tailwind (darkMode: ["class"])
```

---

## 1. Store Zustand (`use-ui-store.ts`)

### Rôle
Gère l'état du thème avec persistance automatique dans `localStorage`.

### Code clé

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // ... autres états UI
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",  // Valeur par défaut
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ressourcefy-ui-store",  // Clé localStorage
      partialize: (state) => ({
        theme: state.theme,  // Seulement le thème est persisté
      }),
    }
  )
);
```

### Points importants
- **Persistance automatique** : Le middleware `persist` sauvegarde automatiquement dans `localStorage`
- **Clé de stockage** : `ressourcefy-ui-store`
- **Valeur par défaut** : `"system"`

---

## 2. Theme Provider (`theme-provider.tsx`)

### Rôle
Applique le thème en ajoutant/supprimant les classes CSS `light` ou `dark` sur `<html>`.

### Fonctionnement

```typescript
"use client";

import { useEffect } from "react";
import { useUIStore } from "../stores/use-ui-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      // Détecte le thème système
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const systemTheme = mediaQuery.matches ? "dark" : "light";
      root.classList.add(systemTheme);

      // Écoute les changements système
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      };
    } else {
      // Thème forcé (light ou dark)
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
```

### Points importants
- **Mode système** : Écoute `prefers-color-scheme` et réagit aux changements
- **Mode forcé** : Applique directement `light` ou `dark`
- **Nettoyage** : Supprime les anciennes classes avant d'ajouter la nouvelle

---

## 3. Variables CSS (`globals.css`)

### Rôle
Définit les couleurs pour les modes clair et sombre via des variables CSS.

### Structure

```css
@layer base {
  :root {
    /* Variables pour le mode clair */
    --background: 45 20% 98%;
    --foreground: 210 40% 15%;
    --primary: 210 40% 25%;
    /* ... autres variables */
  }
  
  .dark {
    /* Variables pour le mode sombre */
    --background: 210 40% 8%;
    --foreground: 45 20% 96%;
    --primary: 210 50% 60%;
    /* ... autres variables */
  }
}
```

### Utilisation dans les composants

```tsx
// Tailwind utilise automatiquement les variables CSS
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Bouton
  </button>
</div>
```

---

## 4. Configuration Tailwind (`tailwind.config.ts`)

### Rôle
Active le mode sombre basé sur les classes CSS.

### Configuration

```typescript
const config: Config = {
  darkMode: ["class"],  // Active le mode sombre via la classe .dark
  // ...
};
```

### Points importants
- `darkMode: ["class"]` permet d'utiliser `dark:` dans Tailwind
- La classe `.dark` est ajoutée sur `<html>` par le `ThemeProvider`

---

## 5. Composant Theme Selector (`theme-selector.tsx`)

### Rôle
Interface utilisateur pour changer le thème.

### Code clé

```typescript
"use client";

import { useUIStore } from "../../stores/use-ui-store";
import type { Theme } from "../../stores/use-ui-store";

export function ThemeSelector() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const themes = [
    { value: "system", label: "Système", icon: <Monitor /> },
    { value: "light", label: "Clair", icon: <Sun /> },
    { value: "dark", label: "Sombre", icon: <Moon /> },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {themes.find((t) => t.value === theme)?.icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
          >
            {themeOption.icon}
            <span>{themeOption.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 6. Intégration dans l'application (`layout.tsx`)

### Rôle
Enveloppe l'application avec le `ThemeProvider`.

### Code

```typescript
import { ThemeProvider } from "../providers/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Points importants
- `suppressHydrationWarning` : Évite les avertissements de hydration Next.js
- Le `ThemeProvider` doit être au niveau racine pour fonctionner partout

---

## Utilisation dans les composants

### Lire le thème actuel

```typescript
import { useUIStore } from "@/src/stores/use-ui-store";

function MyComponent() {
  const theme = useUIStore((state) => state.theme);
  
  return <div>Thème actuel : {theme}</div>;
}
```

### Changer le thème programmatiquement

```typescript
import { useUIStore } from "@/src/stores/use-ui-store";

function MyComponent() {
  const setTheme = useUIStore((state) => state.setTheme);
  
  return (
    <button onClick={() => setTheme("dark")}>
      Activer le mode sombre
    </button>
  );
}
```

### Utiliser les classes Tailwind dark:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Contenu adaptatif
</div>
```

### Utiliser les variables CSS

```tsx
<div className="bg-background text-foreground">
  {/* Utilise automatiquement les bonnes couleurs selon le thème */}
</div>
```

---

## Flux de données

```
┌─────────────────┐
│  User Action    │
│  (ThemeSelector)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  setTheme()     │
│  (useUIStore)   │
└────────┬────────┘
         │
         ├─► localStorage (persist)
         │
         ▼
┌─────────────────┐
│  ThemeProvider  │
│  (useEffect)    │
└────────┬────────┘
         │
         ├─► Ajoute classe .dark ou .light sur <html>
         │
         ▼
┌─────────────────┐
│  globals.css    │
│  Variables CSS  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Composants     │
│  (Tailwind)     │
└─────────────────┘
```

---

## Bonnes pratiques

### ✅ À faire

1. **Utiliser les variables CSS** plutôt que des couleurs hardcodées
   ```tsx
   // ✅ Bon
   <div className="bg-background text-foreground">
   
   // ❌ Mauvais
   <div className="bg-white dark:bg-black">
   ```

2. **Tester les deux modes** lors du développement

3. **Utiliser `suppressHydrationWarning`** sur `<html>` pour éviter les warnings

4. **Persister uniquement les préférences UI** dans le store (pas les données serveur)

### ❌ À éviter

1. **Ne pas stocker le thème sur le backend** (c'est une préférence locale)

2. **Ne pas utiliser `useTheme` hook** (ancien, remplacé par `useUIStore`)

3. **Ne pas hardcoder les couleurs** dans les composants

---

## Extension du système

### Ajouter de nouvelles variables CSS

1. Ajouter dans `globals.css` :

```css
:root {
  --custom-color: 210 40% 50%;
}

.dark {
  --custom-color: 210 50% 70%;
}
```

2. Utiliser dans Tailwind :

```tsx
<div className="bg-[hsl(var(--custom-color))]">
```

### Ajouter un nouveau mode de thème

1. Étendre le type dans `use-ui-store.ts` :

```typescript
export type Theme = "light" | "dark" | "system" | "auto";
```

2. Gérer le nouveau mode dans `theme-provider.tsx`

3. Ajouter l'option dans `theme-selector.tsx`

---

## Dépannage

### Le thème ne change pas

1. Vérifier que `ThemeProvider` est bien dans `layout.tsx`
2. Vérifier que `darkMode: ["class"]` est dans `tailwind.config.ts`
3. Vérifier la console pour les erreurs

### Flash de contenu incorrect (FOUC)

1. Ajouter `suppressHydrationWarning` sur `<html>`
2. Le `ThemeProvider` applique le thème au montage, ce qui peut causer un flash

### Le thème système ne réagit pas

1. Vérifier que `addEventListener` est bien appelé dans `theme-provider.tsx`
2. Vérifier la compatibilité du navigateur avec `prefers-color-scheme`

---

## Résumé

| Élément | Rôle | Fichier |
|---------|------|---------|
| **Store** | État + persistance | `stores/use-ui-store.ts` |
| **Provider** | Application du thème | `providers/theme-provider.tsx` |
| **UI** | Sélecteur de thème | `components/shared/theme-selector.tsx` |
| **Styles** | Variables CSS | `app/globals.css` |
| **Config** | Mode sombre Tailwind | `tailwind.config.ts` |

Le système est **découplé**, **persistant**, et **réactif** aux changements système.
