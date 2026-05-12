// src/lib/piConfig.ts

export const PI_CONFIG = {
  apiKey: 'e7ussxc6eazbx7exyhdqypbnenw5icmxkmllt5hx6ubbh9sypz8w4txamfbavqqv',
  walletAddress: 'GCEQYJZBFPV3TE24J2IC3M66PGUALRXJ6UUBC4VQKO3X4LRWKCPPPU7TF',
  secretSeed: 'SBROVADG73ZAMW6WESUD3T63TMGAWDVK2TLHXU5GR2JUS7MJOIBMLJU3',
  appUrl: 'https://sandbox.minepi.com/app/ash-coin',
  ashPriceIdr: 10000,
  ashPriceUsd: 0.65, 
};

// Definisi tipe data untuk window.pi agar TypeScript ngerti
declare global {
  interface Window {
    pi: any; // Kita pakai 'any' dulu biar fleksibel
  }
}

// Helper function untuk cek apakah sedang jalan di Pi Browser
export const isPiBrowser = () => {
  return typeof window !== 'undefined' && !!window.pi;
};