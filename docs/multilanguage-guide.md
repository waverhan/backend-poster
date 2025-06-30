# Multilanguage System Guide

This guide explains how to use and extend the multilanguage functionality in the PWA POS system.

## Overview

The application uses **Vue I18n** for internationalization with support for multiple languages. Currently supported languages:
- 🇺🇦 **Ukrainian (uk)** - Default language
- 🇺🇸 **English (en)** - Secondary language

## How It Works

### 1. **Language Files Location**
All translations are stored in: `src/i18n/index.ts`

### 2. **Current Language Structure**
```javascript
const messages = {
  uk: {
    nav: { ... },      // Navigation items
    actions: { ... },  // Common actions (add, remove, save, etc.)
    messages: { ... }, // System messages (loading, error, success)
    shop: { ... },     // Shop-related terms
    ui: { ... }        // UI elements
  },
  en: {
    // Same structure as Ukrainian
  }
}
```

## Adding New Languages

### Step 1: Add Language to Available Languages
Edit `src/i18n/index.ts` and update the `availableLanguages` array:

```javascript
export const availableLanguages = [
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },        // Polish
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },      // German
  { code: 'fr', name: 'Français', flag: '🇫🇷' }      // French
]
```

### Step 2: Add Translation Messages
Add the new language to the `messages` object:

```javascript
const messages = {
  uk: { /* existing Ukrainian translations */ },
  en: { /* existing English translations */ },
  pl: {
    nav: {
      home: 'Strona główna',
      shop: 'Sklep',
      cart: 'Koszyk',
      orders: 'Zamówienia',
      profile: 'Profil',
      about: 'O nas',
      contact: 'Kontakt',
      menu: 'Menu'
    },
    actions: {
      add: 'Dodaj',
      remove: 'Usuń',
      edit: 'Edytuj',
      save: 'Zapisz',
      cancel: 'Anuluj',
      // ... more translations
    }
    // ... complete all sections
  }
}
```

## Using Translations in Components

### 1. **In Templates**
```vue
<template>
  <div>
    <h1>{{ $t('nav.shop') }}</h1>
    <button>{{ $t('actions.add') }}</button>
    <p>{{ $t('shop.emptyCart') }}</p>
  </div>
</template>
```

### 2. **In Script (Composition API)**
```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Use in reactive data
const title = computed(() => t('shop.title'))

// Use in methods
const showMessage = () => {
  alert(t('messages.success'))
}
</script>
```

### 3. **With Parameters**
```vue
<template>
  <p>{{ $t('shop.itemsInCart', { count: cartItems }) }}</p>
</template>
```

And in the language file:
```javascript
shop: {
  itemsInCart: 'У кошику {count} товарів' // Ukrainian
  itemsInCart: 'You have {count} items in cart' // English
}
```

## Translation Categories

### **nav** - Navigation Elements
- `home`, `shop`, `cart`, `orders`, `profile`, `about`, `contact`, `menu`

### **actions** - Common Actions
- `add`, `remove`, `edit`, `save`, `cancel`, `confirm`, `back`, `next`, `close`, `search`, `filter`, `sort`

### **messages** - System Messages
- `loading`, `error`, `success`, `warning`, `info`

### **shop** - E-commerce Terms
- `title`, `categories`, `products`, `addToCart`, `price`, `quantity`, `total`, `checkout`, `emptyCart`, `delivery`, `pickup`

### **ui** - User Interface
- `welcome`, `language`, `currency`, `offline`

## Adding New Translation Keys

### 1. **Add to All Languages**
When adding a new translation key, make sure to add it to ALL supported languages:

```javascript
// Add to Ukrainian
uk: {
  shop: {
    // existing keys...
    newKey: 'Нове значення'
  }
}

// Add to English  
en: {
  shop: {
    // existing keys...
    newKey: 'New value'
  }
}
```

### 2. **Use Nested Structure**
Organize translations logically:

```javascript
order: {
  status: {
    pending: 'Очікує',
    confirmed: 'Підтверджено',
    delivered: 'Доставлено'
  },
  payment: {
    cash: 'Готівка',
    card: 'Картка'
  }
}
```

Use in template: `{{ $t('order.status.pending') }}`

## Language Switching

### **Automatic Detection**
The system automatically:
1. Loads saved language from localStorage
2. Falls back to Ukrainian if no saved language
3. Applies language to document.documentElement.lang

### **Manual Switching**
Users can switch languages using the LanguageSwitcher component in the header.

### **Programmatic Switching**
```javascript
import { changeLanguage } from '@/i18n'

// Change to English
changeLanguage('en')

// Change to Ukrainian  
changeLanguage('uk')
```

## Best Practices

### 1. **Consistent Key Naming**
- Use camelCase for keys: `addToCart`, `emptyCart`
- Use descriptive names: `shop.addToCart` instead of `shop.btn1`
- Group related keys: `order.status.pending`

### 2. **Avoid Hardcoded Text**
❌ **Bad:**
```vue
<button>Add to Cart</button>
```

✅ **Good:**
```vue
<button>{{ $t('shop.addToCart') }}</button>
```

### 3. **Handle Pluralization**
For complex pluralization, use Vue I18n's plural rules:

```javascript
uk: {
  cart: {
    items: 'немає товарів | {count} товар | {count} товари | {count} товарів'
  }
}
```

### 4. **Use Fallbacks**
Always provide fallback text:
```vue
{{ $t('shop.newFeature', 'Default text if translation missing') }}
```

## File Organization (Alternative Structure)

For larger applications, you can split translations into separate files:

```
src/i18n/
├── index.ts          # Main i18n configuration
├── locales/
│   ├── uk/
│   │   ├── common.ts
│   │   ├── shop.ts
│   │   └── navigation.ts
│   ├── en/
│   │   ├── common.ts
│   │   ├── shop.ts
│   │   └── navigation.ts
│   └── pl/
│       ├── common.ts
│       ├── shop.ts
│       └── navigation.ts
```

## Testing Translations

### 1. **Check Missing Keys**
Vue I18n will warn in console about missing translation keys.

### 2. **Test All Languages**
Switch between languages and verify:
- All text is translated
- Layout doesn't break with longer/shorter text
- Special characters display correctly

### 3. **Test Fallbacks**
Temporarily remove a translation key to ensure fallback works.

## Common Translation Keys You'll Need

```javascript
// Product related
product: {
  name: 'Назва',
  description: 'Опис', 
  price: 'Ціна',
  inStock: 'В наявності',
  outOfStock: 'Немає в наявності',
  addToCart: 'Додати в кошик'
}

// Order related
order: {
  number: 'Номер замовлення',
  date: 'Дата',
  status: 'Статус',
  total: 'Загальна сума',
  items: 'Товари'
}

// Form related
form: {
  name: 'Ім\'я',
  email: 'Email',
  phone: 'Телефон',
  address: 'Адреса',
  required: 'Обов\'язкове поле',
  invalid: 'Невірний формат'
}
```

## Current Implementation Status

✅ **Implemented:**
- Basic Ukrainian and English translations
- Language switcher in header
- Automatic language persistence
- Navigation translations
- Common actions and messages

🔄 **To Add:**
- Complete product page translations
- Order form translations
- Admin panel translations
- Error message translations
- Email template translations

## Quick Start for Adding Translations

1. **Find the text** you want to translate in the code
2. **Replace hardcoded text** with `{{ $t('category.key') }}`
3. **Add translation keys** to both `uk` and `en` in `src/i18n/index.ts`
4. **Test** by switching languages in the header

Example:
```vue
<!-- Before -->
<button>Add to Cart</button>

<!-- After -->
<button>{{ $t('shop.addToCart') }}</button>
```

And add to `src/i18n/index.ts`:
```javascript
uk: {
  shop: {
    addToCart: 'Додати в кошик'
  }
},
en: {
  shop: {
    addToCart: 'Add to Cart'
  }
}
```
