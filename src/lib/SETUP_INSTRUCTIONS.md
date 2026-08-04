# i18n System Setup Instructions

## Quick Start (3 Steps)

### Step 1: Wrap Your Root Layout with LanguageProvider

Edit `/src/app/layout.tsx`:

```typescript
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

### Step 2: Add Language Selector to Your Header/Navigation

Edit `/src/components/Header.tsx` (or your navigation component):

```typescript
'use client';

import { LanguageSelector } from '@/components/LanguageSelector';

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>My App</h1>
      <LanguageSelector />
    </header>
  );
}
```

### Step 3: Start Using Translations in Components

Example component:

```typescript
'use client';

import { useTranslation } from '@/lib/useTranslation';

export function DashboardHeader() {
  const { t, language } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      <button>{t('buttons.submit')}</button>
      <p>Current language: {language}</p>
    </div>
  );
}
```

## File Structure Created

```
src/
├── lib/
│   ├── i18n.ts                         # Language configuration
│   ├── LanguageContext.tsx             # Context provider
│   ├── useTranslation.ts               # Custom hook
│   ├── I18N_GUIDE.md                   # Complete documentation
│   ├── SETUP_INSTRUCTIONS.md           # This file
│   └── translations/                   # All 19 language files
│       ├── en.json                     # English ✅
│       ├── zh-CN.json                  # Chinese (Simplified) ✅
│       ├── zh-TW.json                  # Chinese (Traditional) ✅
│       ├── ja.json                     # Japanese ✅
│       ├── ko.json                     # Korean ✅
│       ├── ar.json                     # Arabic ✅
│       ├── es.json                     # Spanish ✅
│       ├── pt.json                     # Portuguese ✅
│       ├── it.json                     # Italian ✅
│       ├── de.json                     # German ✅
│       ├── vi.json                     # Vietnamese ✅
│       ├── id.json                     # Indonesian ✅
│       ├── tl.json                     # Filipino (Tagalog) ✅
│       ├── en-SG.json                  # Singaporean English ✅
│       ├── th.json                     # Thai ✅
│       ├── fr.json                     # French ✅
│       ├── el.json                     # Greek ✅
│       ├── hi.json                     # Hindi ✅
│       └── bn.json                     # Bengali ✅
└── components/
    └── LanguageSelector.tsx            # Language switcher (updated)
```

## What's Included

### Core Features ✅
- ✅ 19 supported languages
- ✅ Persistent language preferences (localStorage)
- ✅ RTL language support (Arabic)
- ✅ Context-based state management
- ✅ Custom React hooks
- ✅ Language selector component with multiple variants
- ✅ Professional pharmaceutical & manufacturing translations
- ✅ Graceful error handling with fallbacks

### Pre-translated Sections ✅
All 19 language files include translations for:
- Common UI elements
- Navigation items
- Dashboard screens
- Button labels
- Form fields & validation messages
- Error pages
- User notifications
- Pharmaceutical industry terminology
- Manufacturing industry terminology

## Hook API

The `useTranslation()` hook provides:

```typescript
const {
  t,                    // Basic translation: t('key.path')
  tWithVars,           // With variables: tWithVars('key', { name: 'John' })
  tArray,              // Array of translations
  tObject,             // Object of translations
  language,            // Current language code
  setLanguage,         // Function to change language
  isLoading,           // Translation file loading state
  translations,        // Full translation object (advanced)
} = useTranslation();
```

## Component API

### LanguageSelector Component

**Default dropdown:**
```tsx
<LanguageSelector />
```

**Compact icon button:**
```tsx
<LanguageSelector variant="compact" />
```

**Hide native names (show only English names):**
```tsx
<LanguageSelector showNativeNames={false} />
```

**Custom styling:**
```tsx
<LanguageSelector className="ml-auto" />
```

## Adding More Languages

To add a new language (e.g., Urdu - `ur`):

1. **Create translation file:** `/src/lib/translations/ur.json`
   ```json
   {
     "common": { "language": "زبان", ... },
     "nav": { ... },
     // ... rest of structure
   }
   ```

2. **Update i18n.ts:**
   ```typescript
   export type Language = 
     | 'en'
     // ... existing languages
     | 'ur';  // Add this

   export const LANGUAGES: Record<Language, ...> = {
     // ... existing languages
     'ur': { name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
   };
   ```

3. **Update LanguageSelector.tsx** (optional - for flag emoji):
   ```typescript
   function getFlagEmoji(languageCode: Language): string {
     const flagMap: Record<Language, string> = {
       // ... existing entries
       'ur': '🇵🇰',
     };
     return flagMap[languageCode] || '🌐';
   }
   ```

## Example: Complete Dashboard Component

```typescript
'use client';

import { useTranslation } from '@/lib/useTranslation';
import { isRTL } from '@/lib/i18n';

export function Dashboard() {
  const { t, language, tArray, tObject } = useTranslation();

  // Get array of button labels
  const buttonLabels = tArray([
    'buttons.submit',
    'buttons.cancel',
    'buttons.delete',
  ]);

  // Get form labels as object
  const formLabels = tObject({
    email: 'forms.email',
    password: 'forms.password',
    name: 'forms.name',
  });

  return (
    <div dir={isRTL(language) ? 'rtl' : 'ltr'}>
      <h1>{t('dashboard.title')}</h1>
      
      <section>
        <h2>{t('dashboard.overview')}</h2>
        <p>{t('dashboard.welcome')}</p>
      </section>

      <form>
        <label>{formLabels.email}</label>
        <input type="email" placeholder={t('forms.email')} />
        
        <label>{formLabels.password}</label>
        <input type="password" placeholder={t('forms.password')} />

        <div className="button-group">
          {buttonLabels.map((label, i) => (
            <button key={i}>{label}</button>
          ))}
        </div>
      </form>

      <section>
        <h2>{t('pharmaceutical.inventory')}</h2>
        <table>
          <thead>
            <tr>
              <th>{t('pharmaceutical.batchNumber')}</th>
              <th>{t('pharmaceutical.expiryDate')}</th>
              <th>{t('pharmaceutical.qualityControl')}</th>
            </tr>
          </thead>
        </table>
      </section>
    </div>
  );
}
```

## Translation Keys Available

Use these keys in your components:

### Common
- `common.language` - "Language"
- `common.loading` - "Loading..."
- `common.error` - "Error"
- `common.success` - "Success"
- `common.cancel` - "Cancel"
- `common.save` - "Save"
- `common.delete` - "Delete"
- `common.edit` - "Edit"
- `common.add` - "Add"

### Navigation
- `nav.home` - "Home"
- `nav.dashboard` - "Dashboard"
- `nav.products` - "Products"
- `nav.accounts` - "Accounts"
- `nav.quotes` - "Quotes"
- `nav.settings` - "Settings"
- `nav.profile` - "Profile"
- `nav.logout` - "Logout"
- `nav.login` - "Login"

### Dashboard
- `dashboard.title`
- `dashboard.welcome`
- `dashboard.overview`
- `dashboard.recentActivity`
- `dashboard.stats`
- `dashboard.inventory`
- `dashboard.orders`
- `dashboard.revenue`

### Forms
- `forms.email`
- `forms.password`
- `forms.name`
- `forms.company`
- `forms.phone`
- `forms.address`
- `forms.city`
- `forms.state`
- `forms.zipCode`
- `forms.country`
- `forms.required`
- `forms.invalidEmail`
- `forms.passwordMismatch`

### Pharmaceutical
- `pharmaceutical.inventory`
- `pharmaceutical.products`
- `pharmaceutical.batchNumber`
- `pharmaceutical.expiryDate`
- `pharmaceutical.manufacturingDate`
- `pharmaceutical.qualityControl`
- `pharmaceutical.compliance`
- `pharmaceutical.regulations`
- `pharmaceutical.supplier`
- `pharmaceutical.pricing`

### Manufacturing
- `manufacturing.production`
- `manufacturing.machinery`
- `manufacturing.maintenance`
- `manufacturing.schedule`
- `manufacturing.output`
- `manufacturing.efficiency`
- `manufacturing.downtime`
- `manufacturing.capacity`
- `manufacturing.quality`

### Errors & Messages
- `errors.notFound`
- `errors.notFoundMessage`
- `errors.unauthorized`
- `errors.forbidden`
- `errors.serverError`
- `errors.tryAgain`
- `messages.confirmDelete`
- `messages.saveSuccess`
- `messages.saveFailed`
- `messages.deleteSuccess`
- `messages.deleteFailed`
- `messages.loadingData`

## Debugging

### Check Translations Are Loading
```typescript
const { translations, isLoading } = useTranslation();

console.log('Loading:', isLoading);
console.log('Translations:', translations);
```

### Check Current Language
```typescript
const { language } = useTranslation();
console.log('Current language:', language);
```

### Use Fallback Values
```typescript
const { t } = useTranslation();

// If key doesn't exist, returns the fallback
t('missing.key', 'Fallback Value');
```

## Performance Tips

1. **Memoize translations** for components that don't change language often
2. **Lazy load** complex pages to avoid loading all translations at once
3. **Use specific keys** instead of accessing the entire translations object
4. **Test with all languages** to catch layout/text overflow issues

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers
- ✅ Supports all modern browsers (ES2020+)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Translations not loading | Check JSON files exist in `/translations/`, verify syntax |
| Language not persisting | Clear browser localStorage, verify it's enabled |
| Component not updating | Ensure it's a Client Component (`'use client'`), component uses hook |
| Missing translations | Add key to all language files, use fallback value |
| RTL not working | Check you're using `getLanguageDirection()` or `isRTL()` function |
| Flag emojis wrong | Update the `getFlagEmoji()` function in `LanguageSelector.tsx` |

## Next Steps

1. ✅ Copy the i18n system (already done)
2. ⏳ Wrap your root layout with `LanguageProvider`
3. ⏳ Add `LanguageSelector` to your navigation
4. ⏳ Replace hardcoded text with `t()` calls
5. ⏳ Test all 19 languages
6. ⏳ Deploy and monitor usage

## Support

For detailed documentation, see `/src/lib/I18N_GUIDE.md`

For API documentation, check the JSDoc comments in:
- `/src/lib/useTranslation.ts`
- `/src/lib/LanguageContext.tsx`
- `/src/components/LanguageSelector.tsx`
