// src/hooks/useRewardedAd.ts
// Hook solid untuk handle Rewarded Ad lifecycle:
// - Auto-load saat mount
// - Auto-reload setelah ditonton / gagal
// - Loading state untuk UI feedback
// - Error handling lengkap

import { useEffect, useState, useRef, useCallback } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { AD_REQUEST_OPTIONS } from '../config/ads';

interface UseRewardedAdOptions {
  adUnitId: string;
  onRewarded: () => void;         // Callback saat user selesai nonton
  onAdClosed?: () => void;        // Callback opsional saat iklan ditutup
  onError?: (error: Error) => void;
}

export function useRewardedAd({ adUnitId, onRewarded, onAdClosed, onError }: UseRewardedAdOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simpan ad instance di ref agar tidak re-create tiap render
  const adRef = useRef<RewardedAd | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRY = 3;

  const createAndLoadAd = useCallback(() => {
    // Cleanup instance lama kalau ada
    adRef.current = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: AD_REQUEST_OPTIONS.requestNonPersonalizedAdsOnly,
      keywords: AD_REQUEST_OPTIONS.keywords,
    });

    const ad = adRef.current;

    setIsLoading(true);
    setIsLoaded(false);
    setError(null);

    // Event: Ad siap ditampilkan
    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log(`[AD] ✅ Loaded: ${adUnitId}`);
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
      retryCountRef.current = 0;
    });

    // Event: User dapat reward (selesai nonton)
    const unsubRewarded = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      console.log(`[AD] 🎁 Reward earned: ${adUnitId}`);
      onRewarded();
    });

    // Event: Iklan ditutup → reload untuk berikutnya
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log(`[AD] 🔄 Closed, reloading...`);
      setIsLoaded(false);
      onAdClosed?.();
      // Reload setelah sedikit delay
      setTimeout(() => createAndLoadAd(), 1000);
    });

    // Event: Error load
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (err: Error) => {
      console.error(`[AD] ❌ Error: ${adUnitId}`, err.message);
      setIsLoaded(false);
      setIsLoading(false);
      setError(err.message);
      onError?.(err);

      // Retry dengan exponential backoff
      if (retryCountRef.current < MAX_RETRY) {
        retryCountRef.current += 1;
        const delay = Math.pow(2, retryCountRef.current) * 2000; // 2s, 4s, 8s
        console.log(`[AD] 🔁 Retry ${retryCountRef.current}/${MAX_RETRY} in ${delay}ms`);
        setTimeout(() => createAndLoadAd(), delay);
      }
    });

    // Mulai load
    ad.load();

    // Return cleanup function
    return () => {
      unsubLoaded();
      unsubRewarded();
      unsubClosed();
      unsubError();
    };
  }, [adUnitId, onRewarded, onAdClosed, onError]);

  // Load pertama kali saat mount
  useEffect(() => {
    const cleanup = createAndLoadAd();
    return cleanup;
  }, [adUnitId]); // Re-create jika adUnitId berubah

  // Fungsi show dengan guard
  const showAd = useCallback(() => {
    if (!adRef.current) {
      console.warn('[AD] No ad instance');
      return false;
    }
    if (!isLoaded) {
      console.warn('[AD] Ad not loaded yet, triggering reload...');
      createAndLoadAd();
      return false;
    }
    try {
      adRef.current.show();
      return true;
    } catch (e) {
      console.error('[AD] Show failed:', e);
      createAndLoadAd();
      return false;
    }
  }, [isLoaded, createAndLoadAd]);

  return {
    isLoaded,
    isLoading,
    error,
    showAd,
  };
}