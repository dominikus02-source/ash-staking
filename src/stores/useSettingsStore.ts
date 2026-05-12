// src/stores/useSettingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'id' | 'en';
type Theme = 'dark' | 'light';

interface SettingsState {
  language: Language;
  theme: Theme;
  _hasHydrated: boolean; // Cek status loading storage
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en', // Default ke English aja sekalian nyesuain market
      theme: 'dark',
      _hasHydrated: false,
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'ash-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// --- DEFINISI THEMES ---
export const themes = {
  dark: {
    background: '#0f172a',
    card: '#1e293b',
    text: '#ffffff',
    textSecondary: '#94a3b8',
    primary: '#fbbf24',
    success: '#00ff88',
    error: '#ef4444',
    border: '#334155',
  },
  light: {
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    primary: '#d97706',
    success: '#059669',
    error: '#dc2626',
    border: '#e2e8f0',
  }
} as const;

// --- DEFINISI TRANSLATIONS ---

// 1. Bikin ID sebagai Master Dictionary
const idTranslations = {
  hello: 'Halo,',
  balance: 'Total Saldo',
  account: 'AKUN',
  kyc: 'Verifikasi KYC',
  security: 'KEAMANAN',
  resources: 'SUMBER DAYA',
  language: 'Bahasa',
  theme: 'Tema',
  dark: 'Gelap',
  light: 'Terang',
  logout: 'Keluar',
} as const;

// 2. Extract tipe otomatis dari Master (ID)
export type TranslationKeys = keyof typeof idTranslations;

// 3. Paksa EN pakai struktur kunci yang sama persis kayak ID
const enTranslations: Record<TranslationKeys, string> = {
  hello: 'Hello,',
  balance: 'Total Balance',
  account: 'ACCOUNT',
  kyc: 'KYC Verification',
  security: 'SECURITY',
  resources: 'RESOURCES',
  language: 'Language',
  theme: 'Theme',
  dark: 'Dark',
  light: 'Light',
  logout: 'Logout',
};

// 4. Export kamusnya buat dipake di komponen
export const translations = {
  id: idTranslations,
  en: enTranslations,
};