// src/config/ads.ts
import { Platform } from 'react-native';

export const IS_DEV_MODE = __DEV__;

// App ID — harus cocok dengan app.json
export const ADMOB_APP_ID = {
  android: 'ca-app-pub-1372831940635891~3347511713',
  ios: 'ca-app-pub-1372831940635891~1458002511',
};

// Ad Unit IDs
export const AD_IDS = {
  bannerMarket: IS_DEV_MODE
    ? 'ca-app-pub-3940256099942544/6300978111'    // Test Banner
    : 'ca-app-pub-1372831940635891/6937596013',   // Real: Market_Bottom_Banner

  rewardedFree: IS_DEV_MODE
    ? 'ca-app-pub-3940256099942544/5224354917'    // Test Rewarded
    : 'ca-app-pub-1372831940635891/8410459782',   // Real: Miner_Surge_Free

  rewardedPremium: IS_DEV_MODE
    ? 'ca-app-pub-3940256099942544/5224354917'    // Test Rewarded
    : 'ca-app-pub-1372831940635891/2439961119',   // Real: Miner_Premium_Access
};

// Request options standar — penting untuk compliance & fill rate
export const AD_REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: false,
  keywords: ['crypto', 'mining', 'blockchain', 'finance', 'investment'],
};