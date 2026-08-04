# i18n Implementation Guide

## Overview

This is a comprehensive internationalization (i18n) system for Next.js that supports 19 languages across pharmaceutical and manufacturing verticals. The system includes:

- Language configuration with metadata
- Translation files for each language
- Context provider for global state management
- Custom hooks for accessing translations
- Language selector component
- Persistent language preferences

## Supported Languages (19)

1. **English** (`en`) - 🇬🇧
2. **Chinese (Simplified)** (`zh-CN`) - 🇨🇳
3. **Chinese (Traditional)** (`zh-TW`) - 🇹🇼
4. **Japanese** (`ja`) - 🇯🇵
5. **Korean** (`ko`) - 🇰🇷
6. **Arabic** (`ar`) - 🇸🇦
7. **Spanish** (`es`) - 🇪🇸
8. **Portuguese** (`pt`) - 🇵🇹
9. **Italian** (`it`) - 🇮🇹
10. **German** (`de`) - 🇩🇪
11. **Vietnamese** (`vi`) - 🇻🇳
12. **Indonesian** (`id`) - 🇮🇩
13. **Filipino (Tagalog)** (`tl`) - 🇵🇭
14. **Singaporean English** (`en-SG`) - 🇸🇬
15. **Thai** (`th`) - 🇹🇭
16. **French** (`fr`) - 🇫🇷
17. **Greek** (`el`) - 🇬🇷
18. **Hindi** (`hi`) - 🇮🇳
19. **Bengali** (`bn`) - 🇧🇩

## Architecture

### Core Files

1. **`/lib/i18n.ts`** - Language configuration and type definitions
2. **`/lib/LanguageContext.tsx`** - React Context provider for language state
3. **`/lib/useTranslation.ts`** - Custom hook for accessing translations
4. **`/lib/translations/`** - JSON translation files (one per language)
5. **`/components/LanguageSelector.tsx`** - Language switcher component

## Setup Instructions

### 1. Wrap Your App with the Language Provider

In your root layout (`/app/layout.tsx`):

```tsx
import { LanguageProvider } from '@/lib/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
```

### 2. Use Translations in Components

```tsx
'use client';

import { useTranslation } from '@/lib/useTranslation';

export function MyComponent() {
  const { t, language, setLanguage, isLoading } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      <button>{t('buttons.submit')}</button>
    </div>
  );
}
```

### 3. Add Language Selector to Header/Navigation

```tsx
import { LanguageSelector } from '@/components/LanguageSelector';

export function Header() {
  return (
    <header>
      <LanguageSelector />
    </header>
  );
}
```

## Usage Examples

### Basic Translation

```tsx
const { t } = useTranslation();

<h1>{t('dashboard.title')}</h1>
<button>{t('buttons.submit')}</button>
```

### Translation with Variables

```tsx
const { tWithVars } = useTranslation();

// In your JSON: "welcome": "Welcome, {{name}}!"
const message = tWithVars('dashboard.welcome', { name: 'John Doe' });
```

### Translate Arrays

```tsx
const { tArray } = useTranslation();

const items = tArray([
  'buttons.submit',
  'buttons.cancel',
  'buttons.download'
]);
// Returns: ['Submit', 'Cancel', 'Download']
```

### Translate Objects

```tsx
const { tObject } = useTranslation();

const form = tObject({
  email: 'forms.email',
  password: 'forms.password',
  name: 'forms.name'
});
// Returns: { email: 'Email Address', password: 'Password', name: 'Full Name' }
```

### Language Switching

```tsx
const { language, setLanguage } = useTranslation();

<button onClick={() => setLanguage('ja')}>
  Switch to Japanese
</button>
```

### Check Current Language

```tsx
const { language } = useTranslation();

if (language === 'ar') {
  // Apply RTL styles
}
```

## Language Selector Component Variants

### Standard Dropdown
```tsx
<LanguageSelector />
```

### Compact (Icon Only)
```tsx
<LanguageSelector variant="compact" />
```

### With Native Names
```tsx
<LanguageSelector showNativeNames={true} />
```

### Custom Styling
```tsx
<LanguageSelector className="ml-4" />
```

## Translation File Structure

Each translation file (`/lib/translations/[lang].json`) has the following structure:

```json
{
  "common": {
    "language": "Language",
    "loading": "Loading...",
    // ... common UI elements
  },
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard",
    // ... navigation items
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome",
    // ... dashboard-specific translations
  },
  "buttons": {
    "submit": "Submit",
    "cancel": "Cancel",
    // ... button labels
  },
  "forms": {
    "email": "Email Address",
    "password": "Password",
    // ... form labels and messages
  },
  "errors": {
    "notFound": "Page Not Found",
    "serverError": "Server Error",
    // ... error messages
  },
  "messages": {
    "saveSuccess": "Saved successfully",
    "deleteFailed": "Failed to delete",
    // ... user messages
  },
  "pharmaceutical": {
    "inventory": "Pharmaceutical Inventory",
    "batchNumber": "Batch Number",
    // ... pharmacy-specific terms
  },
  "manufacturing": {
    "production": "Production Schedule",
    "machinery": "Machinery & Equipment",
    // ... manufacturing-specific terms
  }
}
```

## Creating Translation Files for New Languages

### Template Structure

Create a new file at `/lib/translations/[language-code].json`:

```json
{
  "common": { /* ... */ },
  "nav": { /* ... */ },
  "dashboard": { /* ... */ },
  "buttons": { /* ... */ },
  "forms": { /* ... */ },
  "errors": { /* ... */ },
  "messages": { /* ... */ },
  "pharmaceutical": { /* ... */ },
  "manufacturing": { /* ... */ }
}
```

### Steps to Add a New Language

1. Copy an existing translation file (e.g., `en.json`)
2. Rename it to your language code (e.g., `es.json`)
3. Translate all values while keeping keys identical
4. Add the language to the `Language` type in `/lib/i18n.ts`
5. Add the language to the `LANGUAGES` object in `/lib/i18n.ts`
6. (Optional) Update the flag emoji map in `LanguageSelector.tsx`

### Example: Adding Spanish (es)

**File:** `/lib/translations/es.json`

```json
{
  "common": {
    "language": "Idioma",
    "loading": "Cargando...",
    // ... rest of translations
  },
  // ... rest of sections
}
```

**Update `/lib/i18n.ts`:**

```typescript
export type Language = 
  | 'en'
  | 'ja'
  // ... other languages
  | 'es';  // Add this

export const LANGUAGES: Record<Language, { name: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  // ... other languages
  'es': { name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
};
```

## Features

### Persistent Language Selection

The selected language is automatically saved to `localStorage` and restored on next visit.

```typescript
// Storage key: 'ptg_language'
// Automatically handled by LanguageProvider
```

### RTL Language Support

Built-in support for RTL languages (currently Arabic).

```typescript
import { isRTL } from '@/lib/i18n';

const dir = isRTL(language) ? 'rtl' : 'ltr';
```

### Loading States

Handle loading states for translation files:

```tsx
const { isLoading, t } = useTranslation();

if (isLoading) {
  return <div>Loading translations...</div>;
}

return <div>{t('dashboard.title')}</div>;
```

### Error Handling

Graceful fallbacks if translations are missing:

```tsx
const { t } = useTranslation();

// If key not found, returns the key itself
<h1>{t('missing.key')}</h1> // Renders: "missing.key"

// With default value
<h1>{t('missing.key', 'Default Title')}</h1> // Renders: "Default Title"
```

## Best Practices

### 1. Use Semantic Keys
```tsx
// Good
t('pharmaceutical.batchNumber')

// Avoid
t('batch_num') or t('bn')
```

### 2. Keep Keys Consistent Across Languages
All language files should have identical key structures.

### 3. Use Variables for Dynamic Content
```tsx
// Good
tWithVars('messages.welcome', { name: 'John' })

// Avoid storing dynamic content in translation files
```

### 4. Group Related Translations
Organize translations by feature/section in the JSON structure.

### 5. Test with All Supported Languages
- Check text overflow and layout issues
- Verify RTL rendering for Arabic
- Test with long translations (some languages need more space)

### 6. Use Semantic HTML
```tsx
<h1 lang={language}>{t('dashboard.title')}</h1>
<p dir={getLanguageDirection(language)}>{t('dashboard.welcome')}</p>
```

## Performance Considerations

### Code Splitting
Translation files are loaded on-demand when the language changes, not all at once.

### Memoization
Consider memoizing translation results for frequently used keys:

```tsx
import { useMemo } from 'react';
import { useTranslation } from '@/lib/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  const labels = useMemo(() => ({
    title: t('dashboard.title'),
    welcome: t('dashboard.welcome'),
  }), [t]);

  return <div>{labels.title}</div>;
}
```

### Caching
Translation files are cached by the dynamic import system.

## Troubleshooting

### Translations Not Loading
- Check that translation files exist in `/lib/translations/`
- Verify JSON syntax in translation files
- Check browser console for errors

### Language Not Persisting
- Clear browser storage and try again
- Verify localStorage is enabled
- Check that `LanguageProvider` wraps your app

### Component Not Updating on Language Change
- Ensure component is a Client Component (`'use client'`)
- Verify `useTranslation()` hook is called within `LanguageProvider`
- Check that `LanguageProvider` is at the root of your app tree

### Missing Translations
- Check that the key path matches your translation file structure
- Use the fallback value parameter: `t('key', 'fallback')`
- Add missing keys to all language files

## Migration from Hardcoded Text

Before:
```tsx
<button>Submit</button>
```

After:
```tsx
import { useTranslation } from '@/lib/useTranslation';

export function MyButton() {
  const { t } = useTranslation();
  return <button>{t('buttons.submit')}</button>;
}
```

## File Structure Overview

```
src/
├── lib/
│   ├── i18n.ts                    # Language config & types
│   ├── LanguageContext.tsx         # Context provider
│   ├── useTranslation.ts          # Custom hook
│   ├── I18N_GUIDE.md              # This file
│   └── translations/
│       ├── en.json                 # English
│       ├── zh-CN.json              # Chinese (Simplified)
│       ├── zh-TW.json              # Chinese (Traditional)
│       ├── ja.json                 # Japanese
│       ├── ko.json                 # Korean
│       ├── ar.json                 # Arabic
│       ├── es.json                 # Spanish
│       ├── pt.json                 # Portuguese
│       ├── it.json                 # Italian
│       ├── de.json                 # German
│       ├── vi.json                 # Vietnamese
│       ├── id.json                 # Indonesian
│       ├── tl.json                 # Filipino
│       ├── en-SG.json              # Singaporean English
│       ├── th.json                 # Thai
│       ├── fr.json                 # French
│       ├── el.json                 # Greek
│       ├── hi.json                 # Hindi
│       └── bn.json                 # Bengali
└── components/
    └── LanguageSelector.tsx        # Language switcher
```

## Related Documentation

- [React Context API](https://react.dev/reference/react/useContext)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization-routing)
- [Localization Best Practices](https://www.w3.org/International/questions/qa-what-is-i18n)
