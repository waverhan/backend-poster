import { createI18n } from 'vue-i18n'

// Get saved language or default to Ukrainian
const savedLanguage = localStorage.getItem('pwa-pos-language') || 'uk'

// Basic translations to start with
const messages = {
  uk: {
    // Navigation
    nav: {
      home: 'Головна',
      shop: 'Магазин',
      cart: 'Кошик',
      orders: 'Замовлення',
      profile: 'Профіль',
      about: 'Про нас',
      contact: 'Контакти',
      menu: 'Меню'
    },
    // Common actions
    actions: {
      add: 'Додати',
      remove: 'Видалити',
      edit: 'Редагувати',
      save: 'Зберегти',
      cancel: 'Скасувати',
      confirm: 'Підтвердити',
      back: 'Назад',
      next: 'Далі',
      close: 'Закрити',
      search: 'Пошук',
      filter: 'Фільтр',
      sort: 'Сортування'
    },
    // Messages
    messages: {
      loading: 'Завантаження...',
      error: 'Помилка',
      success: 'Успішно',
      warning: 'Попередження',
      info: 'Інформація'
    },
    // Shop related
    shop: {
      title: 'Магазин',
      categories: 'Категорії',
      products: 'Товари',
      addToCart: 'Додати в кошик',
      price: 'Ціна',
      quantity: 'Кількість',
      total: 'Всього',
      checkout: 'Оформити замовлення',
      emptyCart: 'Кошик порожній',
      delivery: 'Доставка',
      pickup: 'Самовивіз'
    },
    // Units
    units: {
      piece: 'шт',
      pieces: 'шт',
      kg: 'кг',
      gram: 'г',
      liter: 'л',
      ml: 'мл',
      per50g: 'за 50г',
      perKg: 'за кг',
      perPiece: 'за шт'
    },
    // Common UI
    ui: {
      welcome: 'Ласкаво просимо',
      language: 'Мова',
      currency: 'грн',
      offline: 'Ви офлайн. Деякі функції можуть не працювати.'
    },
    // Mobile Menu
    menu: {
      browseProducts: 'Переглянути товари',
      storeLocations: 'Магазини',
      myOrders: 'Мої замовлення',
      categories: 'Категорії',
      contactUs: 'Контакти',
      aiAssistant: 'AI Помічник'
    },
    // Order related
    order: {
      number: 'Номер замовлення',
      status: 'Статус',
      created: 'Створено',
      total: 'Загальна сума',
      items: 'Товари',
      customer: 'Клієнт',
      delivery: 'Доставка',
      pickup: 'Самовивіз',
      notes: 'Коментарі',
      confirmation: 'Підтвердження замовлення',
      thankYou: 'Дякуємо за замовлення!',
      emailSent: 'Лист з підтвердженням надіслано на вашу електронну пошту',
      statusUpdate: 'Оновлення статусу замовлення',
      statuses: {
        pending: 'Очікує',
        confirmed: 'Підтверджено',
        preparing: 'Готується',
        ready: 'Готове',
        delivered: 'Доставлено',
        completed: 'Виконано',
        cancelled: 'Скасовано'
      }
    },
    // Email related
    email: {
      subject: {
        orderConfirmation: 'Підтвердження замовлення',
        statusUpdate: 'Оновлення статусу замовлення'
      },
      greeting: 'Вітаємо',
      thankYou: 'Дякуємо за ваше замовлення',
      orderDetails: 'Деталі замовлення',
      deliveryInfo: 'Інформація про доставку',
      contactInfo: 'Контактна інформація',
      autoMessage: 'Це автоматичне повідомлення. Будь ласка, не відповідайте на цей лист.'
    },
    // Notifications
    notifications: {
      orderCreated: 'Замовлення успішно створено',
      emailSent: 'Електронний лист надіслано',
      emailFailed: 'Не вдалося надіслати електронний лист',
      statusUpdated: 'Статус замовлення оновлено'
    }
  },
  en: {
    nav: {
      home: 'Home',
      shop: 'Shop',
      cart: 'Cart',
      orders: 'Orders',
      profile: 'Profile',
      about: 'About',
      contact: 'Contact',
      menu: 'Menu'
    },
    actions: {
      add: 'Add',
      remove: 'Remove',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort'
    },
    messages: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    shop: {
      title: 'Shop',
      categories: 'Categories',
      products: 'Products',
      addToCart: 'Add to Cart',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      checkout: 'Checkout',
      emptyCart: 'Cart is empty',
      delivery: 'Delivery',
      pickup: 'Pickup'
    },
    // Units
    units: {
      piece: 'pc',
      pieces: 'pcs',
      kg: 'kg',
      gram: 'g',
      liter: 'l',
      ml: 'ml',
      per50g: 'per 50g',
      perKg: 'per kg',
      perPiece: 'per pc'
    },
    ui: {
      welcome: 'Welcome',
      language: 'Language',
      currency: '₴',
      offline: 'You\'re offline. Some features may not work.'
    },
    // Mobile Menu
    menu: {
      browseProducts: 'Browse Products',
      storeLocations: 'Store Locations',
      myOrders: 'My Orders',
      categories: 'Categories',
      contactUs: 'Contact Us',
      aiAssistant: 'AI Assistant'
    },
    // Order related
    order: {
      number: 'Order Number',
      status: 'Status',
      created: 'Created',
      total: 'Total Amount',
      items: 'Items',
      customer: 'Customer',
      delivery: 'Delivery',
      pickup: 'Pickup',
      notes: 'Notes',
      confirmation: 'Order Confirmation',
      thankYou: 'Thank you for your order!',
      emailSent: 'Confirmation email sent to your email address',
      statusUpdate: 'Order Status Update',
      statuses: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        ready: 'Ready',
        delivered: 'Delivered',
        completed: 'Completed',
        cancelled: 'Cancelled'
      }
    },
    // Email related
    email: {
      subject: {
        orderConfirmation: 'Order Confirmation',
        statusUpdate: 'Order Status Update'
      },
      greeting: 'Hello',
      thankYou: 'Thank you for your order',
      orderDetails: 'Order Details',
      deliveryInfo: 'Delivery Information',
      contactInfo: 'Contact Information',
      autoMessage: 'This is an automated message. Please do not reply to this email.'
    },
    // Notifications
    notifications: {
      orderCreated: 'Order created successfully',
      emailSent: 'Email sent',
      emailFailed: 'Failed to send email',
      statusUpdated: 'Order status updated'
    }
  }
}

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLanguage,
  fallbackLocale: 'uk',
  messages,
  globalInjection: true
})

export default i18n

// Helper function to change language
export const changeLanguage = (locale: string) => {
  i18n.global.locale.value = locale
  localStorage.setItem('pwa-pos-language', locale)
  document.documentElement.lang = locale
}

// Available languages (starting with 2 main languages)
export const availableLanguages = [
  { code: 'uk', name: 'UA', flag: '🇺🇦' },
  { code: 'en', name: 'EN', flag: '🇺🇸' }
]

// Get current language info
export const getCurrentLanguage = () => {
  const currentLocale = i18n.global.locale.value
  return availableLanguages.find(lang => lang.code === currentLocale) || availableLanguages[0]
}
