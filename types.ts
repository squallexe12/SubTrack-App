
export type Category = 'Entertainment' | 'Music' | 'Utilities' | 'Work' | 'Shopping' | 'Health' | 'Other';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  currency: string;
  nextBillingDate: string; // ISO date string YYYY-MM-DD
  category: Category;
  cycle: 'monthly' | 'yearly';
  color?: string;
}

export const CATEGORIES: Category[] = ['Entertainment', 'Music', 'Utilities', 'Work', 'Shopping', 'Health', 'Other'];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', rateToUSD: 1 },
  { code: 'EUR', symbol: '€', rateToUSD: 1.08 },
  { code: 'TRY', symbol: '₺', rateToUSD: 0.031 },
  { code: 'GBP', symbol: '£', rateToUSD: 1.27 },
];

export const DEFAULT_CURRENCY = 'USD';

export interface ServicePreset {
  name: string;
  defaultCost: number;
  currency: string;
  category: Category;
  color: string;
  iconClass: string;
}

export const PRESETS: ServicePreset[] = [
  { name: 'Netflix', defaultCost: 15.49, currency: 'USD', category: 'Entertainment', color: '#E50914', iconClass: 'fa-brands fa-netflix' },
  { name: 'Spotify', defaultCost: 10.99, currency: 'USD', category: 'Music', color: '#1DB954', iconClass: 'fa-brands fa-spotify' },
  { name: 'YouTube', defaultCost: 13.99, currency: 'USD', category: 'Entertainment', color: '#FF0000', iconClass: 'fa-brands fa-youtube' },
  { name: 'Amazon Prime', defaultCost: 14.99, currency: 'USD', category: 'Shopping', color: '#00A8E1', iconClass: 'fa-brands fa-amazon' },
  { name: 'Steam', defaultCost: 10.00, currency: 'USD', category: 'Entertainment', color: '#171a21', iconClass: 'fa-brands fa-steam' },
  { name: 'Apple', defaultCost: 10.99, currency: 'USD', category: 'Utilities', color: '#A2AAAD', iconClass: 'fa-brands fa-apple' },
];

// --- Multi-Language & Features ---

export type Language = 'en' | 'tr' | 'de' | 'fr' | 'es';

export interface TradeOffItem {
  id: string;
  name: string;
  cost: number;
  currency: string;
  icon: string;
}

export const TRADE_OFFS: Record<Language, TradeOffItem[]> = {
  en: [
    { id: 'coffee', name: 'Coffee', cost: 5, currency: 'USD', icon: '☕' },
    { id: 'meal', name: 'Burger', cost: 12, currency: 'USD', icon: '🍔' },
    { id: 'cinema', name: 'Movie Ticket', cost: 16, currency: 'USD', icon: '🎬' },
  ],
  tr: [
    { id: 'coffee', name: 'Kahve', cost: 90, currency: 'TRY', icon: '☕' },
    { id: 'meal', name: 'Lahmacun', cost: 160, currency: 'TRY', icon: '🌯' },
    { id: 'cinema', name: 'Sinema', cost: 220, currency: 'TRY', icon: '🎬' },
  ],
  de: [
    { id: 'coffee', name: 'Kaffee', cost: 4.5, currency: 'EUR', icon: '☕' },
    { id: 'meal', name: 'Döner', cost: 7, currency: 'EUR', icon: '🥙' },
    { id: 'cinema', name: 'Kino', cost: 14, currency: 'EUR', icon: '🎬' },
  ],
  fr: [
    { id: 'coffee', name: 'Café', cost: 4, currency: 'EUR', icon: '☕' },
    { id: 'meal', name: 'Croissant', cost: 2.5, currency: 'EUR', icon: '🥐' },
    { id: 'cinema', name: 'Cinéma', cost: 13, currency: 'EUR', icon: '🎬' },
  ],
  es: [
    { id: 'coffee', name: 'Café', cost: 3, currency: 'EUR', icon: '☕' },
    { id: 'meal', name: 'Tapas', cost: 6, currency: 'EUR', icon: '🥘' },
    { id: 'cinema', name: 'Cine', cost: 10, currency: 'EUR', icon: '🎬' },
  ]
};

export const TRANSLATIONS = {
  en: {
    header: { title: "SubTrack", subtitle: "CLOUD", addNew: "Add New", login: "Sign In", logout: "Sign Out" },
    dashboard: {
      totalExpenses: "Total Expenses",
      convertedBase: "Converted to base currency",
      breakdown: "Expense Breakdown",
      noData: "Add subscriptions to see analytics",
      tradeOffLabel: "Trade-Off Context",
    },
    vibe: {
      low: "Wallet is Happy 😎",
      medium: "Stay Focused 🤔",
      high: "Money is Flying 💸"
    },
    list: {
      title: "Your Subscriptions",
      active: "Active",
      emptyTitle: "No subscriptions yet",
      emptyDesc: "Start tracking your recurring expenses by clicking the \"Add New\" button.",
      dueSoon: "Due Soon",
      overdue: "Overdue",
      daysLeft: "days left",
      daysAgo: "days ago",
      billed: "Billed",
      equals: "Equals"
    },
    form: {
      title: "Add Subscription",
      quickAdd: "Quick Presets",
      nameLabel: "Service Name",
      namePlaceholder: "e.g. Netflix",
      categoryLabel: "Category",
      costLabel: "Cost",
      dateLabel: "Next Billing",
      billingCycle: "Billing Cycle:",
      monthly: "Monthly",
      yearly: "Yearly",
      cancel: "Cancel",
      save: "Save Subscription"
    },
    login: {
      welcome: "Welcome to SubTrack",
      desc: "The ultimate cloud-based subscription manager. Sign in to sync your data across devices.",
      btn: "Sign in with Google"
    },
    validation: {
        error: "Please fill in all fields correctly!",
        success: "Subscription Added Successfully!",
    }
  },
  tr: {
    header: { title: "SubTrack", subtitle: "BULUT", addNew: "Yeni Ekle", login: "Giriş", logout: "Çıkış" },
    dashboard: {
      totalExpenses: "Toplam Gider",
      convertedBase: "Baz para birimine çevrildi",
      breakdown: "Harcama Dağılımı",
      noData: "Analiz için abonelik ekleyin",
      tradeOffLabel: "Karşılaştırma",
    },
    vibe: {
      low: "Cüzdan Keyifli 😎",
      medium: "Dikkatli Git 🤔",
      high: "Para Uçuyor 💸"
    },
    list: {
      title: "Aboneliklerin",
      active: "Aktif",
      emptyTitle: "Henüz abonelik yok",
      emptyDesc: "Giderlerini takip etmeye başlamak için ekle.",
      dueSoon: "Yaklaşıyor",
      overdue: "Gecikmiş",
      daysLeft: "gün kaldı",
      daysAgo: "gün geçti",
      billed: "Ödeme",
      equals: "Yaklaşık"
    },
    form: {
      title: "Abonelik Ekle",
      quickAdd: "Hızlı Ekleme",
      nameLabel: "Servis Adı",
      namePlaceholder: "ör. Netflix",
      categoryLabel: "Kategori",
      costLabel: "Tutar",
      dateLabel: "Tarih",
      billingCycle: "Döngü:",
      monthly: "Aylık",
      yearly: "Yıllık",
      cancel: "İptal",
      save: "Kaydet"
    },
    login: {
      welcome: "SubTrack'e Hoşgeldin",
      desc: "Bulut tabanlı abonelik yöneticisi. Verilerini senkronize etmek için giriş yap.",
      btn: "Google ile Giriş Yap"
    },
    validation: {
        error: "Lütfen tüm alanları eksiksiz doldurun!",
        success: "Abonelik Eklendi!",
    }
  },
  de: {
    header: { title: "SubTrack", subtitle: "CLOUD", addNew: "Neu", login: "Anmelden", logout: "Abmelden" },
    dashboard: {
      totalExpenses: "Gesamtausgaben",
      convertedBase: "In Basiswährung umgerechnet",
      breakdown: "Ausgabenübersicht",
      noData: "Keine Daten vorhanden",
      tradeOffLabel: "Vergleichswert",
    },
    vibe: {
      low: "Guter Bereich 😎",
      medium: "Aufpassen 🤔",
      high: "Geld fliegt weg 💸"
    },
    list: {
      title: "Abonnements",
      active: "Aktiv",
      emptyTitle: "Keine Abonnements",
      emptyDesc: "Füge Abonnements hinzu, um zu starten.",
      dueSoon: "Fällig",
      overdue: "Überfällig",
      daysLeft: "Tage übrig",
      daysAgo: "Tage her",
      billed: "Abgebucht",
      equals: "Entspricht"
    },
    form: {
      title: "Abo Hinzufügen",
      quickAdd: "Schnellwahl",
      nameLabel: "Name",
      namePlaceholder: "z.B. Spotify",
      categoryLabel: "Kategorie",
      costLabel: "Kosten",
      dateLabel: "Nächste Rechnung",
      billingCycle: "Zyklus:",
      monthly: "Monatlich",
      yearly: "Jährlich",
      cancel: "Abbrechen",
      save: "Speichern"
    },
    login: {
      welcome: "Willkommen bei SubTrack",
      desc: "Melde dich an, um deine Abonnements in der Cloud zu speichern.",
      btn: "Mit Google anmelden"
    },
    validation: {
        error: "Bitte alle Felder korrekt ausfüllen!",
        success: "Abonnement hinzugefügt!",
    }
  },
  fr: {
    header: { title: "SubTrack", subtitle: "CLOUD", addNew: "Ajouter", login: "Connexion", logout: "Déconnexion" },
    dashboard: {
      totalExpenses: "Dépenses Totales",
      convertedBase: "Converti en devise de base",
      breakdown: "Répartition",
      noData: "Ajoutez des abonnements",
      tradeOffLabel: "Contexte",
    },
    vibe: {
      low: "Tout va bien 😎",
      medium: "Attention 🤔",
      high: "L'argent vole 💸"
    },
    list: {
      title: "Vos Abonnements",
      active: "Actif",
      emptyTitle: "Aucun abonnement",
      emptyDesc: "Commencez à suivre vos dépenses récurrentes.",
      dueSoon: "Bientôt dû",
      overdue: "En retard",
      daysLeft: "jours restants",
      daysAgo: "jours passés",
      billed: "Facturé",
      equals: "Équivaut à"
    },
    form: {
      title: "Ajouter",
      quickAdd: "Rapide",
      nameLabel: "Nom",
      namePlaceholder: "ex: Netflix",
      categoryLabel: "Catégorie",
      costLabel: "Coût",
      dateLabel: "Prochaine Facture",
      billingCycle: "Cycle:",
      monthly: "Mensuel",
      yearly: "Annuel",
      cancel: "Annuler",
      save: "Enregistrer"
    },
    login: {
      welcome: "Bienvenue sur SubTrack",
      desc: "Le gestionnaire d'abonnements ultime. Connectez-vous pour synchroniser.",
      btn: "Continuer avec Google"
    },
    validation: {
        error: "Veuillez remplir tous les champs !",
        success: "Abonnement ajouté !",
    }
  },
  es: {
    header: { title: "SubTrack", subtitle: "CLOUD", addNew: "Añadir", login: "Entrar", logout: "Salir" },
    dashboard: {
      totalExpenses: "Gastos Totales",
      convertedBase: "Convertido a moneda base",
      breakdown: "Desglose",
      noData: "Añade suscripciones",
      tradeOffLabel: "Comparación",
    },
    vibe: {
      low: "Cartera Feliz 😎",
      medium: "Cuidado 🤔",
      high: "Dinero Volando 💸"
    },
    list: {
      title: "Suscripciones",
      active: "Activo",
      emptyTitle: "Sin suscripciones",
      emptyDesc: "Empieza a rastrear tus gastos recurrentes.",
      dueSoon: "Vence pronto",
      overdue: "Vencido",
      daysLeft: "días quedan",
      daysAgo: "días pasados",
      billed: "Cobrado",
      equals: "Equivale a"
    },
    form: {
      title: "Añadir Suscripción",
      quickAdd: "Rápido",
      nameLabel: "Nombre",
      namePlaceholder: "ej. Netflix",
      categoryLabel: "Categoría",
      costLabel: "Coste",
      dateLabel: "Próximo Pago",
      billingCycle: "Ciclo:",
      monthly: "Mensual",
      yearly: "Anual",
      cancel: "Cancelar",
      save: "Guardar"
    },
    login: {
      welcome: "Bienvenido a SubTrack",
      desc: "Gestiona tus suscripciones en la nube. Inicia sesión para sincronizar.",
      btn: "Iniciar sesión con Google"
    },
    validation: {
        error: "¡Por favor complete todos los campos!",
        success: "¡Suscripción agregada!",
    }
  }
};
