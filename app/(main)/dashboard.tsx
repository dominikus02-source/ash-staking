// app/(main)/dashboard.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Cpu, Crown, Gift, Pause, Play, Zap, Info } from 'lucide-react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Alert, Animated, Dimensions, Image, ScrollView,
  StyleSheet, Text, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/context/ThemeContext';
import { useMiningSync } from '../../src/hooks/useMiningSync';
import { useRewardedAd } from '../../src/hooks/useRewardedAd';
import { useAuthStore } from '../../src/stores/useAuthStore';
import MiningDiagnosticModal from '../../components/MiningDiagnosticModal';
import OnboardingModal from '../../components/OnboardingModal';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_IDS, AD_REQUEST_OPTIONS } from '../../src/config/ads';

const ONBOARDING_KEY = 'ash_onboarding_done';
const { width } = Dimensions.get('window');
const MINING_DURATION_SEC = 21600;

export default function DashboardScreen() {
  const router = useRouter();
  const { userMeta } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    miningData, displayBalance, startMining,
    claimMining, claimDailyBonus, activateNormalBoost, activatePremiumBoost,
  } = useMiningSync();

  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const timerRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // --- IKLAN: Standard Boost (Free) ---
  const {
    isLoaded: isStandardAdLoaded,
    isLoading: isStandardAdLoading,
    showAd: showStandardAd,
  } = useRewardedAd({
    adUnitId: __DEV__ ? TestIds.REWARDED : AD_IDS.rewardedFree,
    onRewarded: () => {
      activateNormalBoost();
      Alert.alert('Boost Aktif! ⚡', 'Standard Boost berhasil diaktifkan selama 30 menit!');
    },
    onError: (err) => console.error('[DASHBOARD] Standard Ad error:', err.message),
  });

  // --- IKLAN: Premium Boost ---
  const {
    isLoaded: isPremiumAdLoaded,
    isLoading: isPremiumAdLoading,
    showAd: showPremiumAd,
  } = useRewardedAd({
    adUnitId: __DEV__ ? TestIds.REWARDED : AD_IDS.rewardedPremium,
    onRewarded: () => {
      activatePremiumBoost();
      Alert.alert('Premium Boost Aktif! 👑', 'Premium Boost berhasil diaktifkan selama 7 hari!');
    },
    onError: (err) => console.error('[DASHBOARD] Premium Ad error:', err.message),
  });

  // ONBOARDING CHECKER
  useEffect(() => {
    if (onboardingChecked) return;
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      if (!val) {
        setShowOnboarding(true);
      }
      setOnboardingChecked(true);
    });
  }, [onboardingChecked]);

  // DAILY CLAIM CHECKER
  useEffect(() => {
    if (miningData?.lastDailyClaim) {
      const lastClaim = new Date(miningData.lastDailyClaim).toDateString();
      setHasClaimedToday(lastClaim === new Date().toDateString());
    }
  }, [miningData?.lastDailyClaim]);

  // MINING ANIMATION
  useEffect(() => {
    if (miningData?.mining?.isActive) {
      const loopPulse = () => Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ]).start(loopPulse);
      loopPulse();

      const loopSpin = () => Animated.timing(spinAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
        .start(() => { spinAnim.setValue(0); loopSpin(); });
      loopSpin();
    } else {
      pulseAnim.stopAnimation(); 
      spinAnim.stopAnimation();
      pulseAnim.setValue(0); 
      spinAnim.setValue(0);
    }
  }, [miningData?.mining?.isActive]);

  // TIMER
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const isActive = miningData?.mining?.isActive;
    const startTimeRaw = miningData?.mining?.startTime;
    
    if (isActive && startTimeRaw) {
      let startMs: number;
      if (typeof startTimeRaw === 'number') startMs = startTimeRaw < 1e12 ? startTimeRaw * 1000 : startTimeRaw;
      else if (startTimeRaw?.seconds) startMs = startTimeRaw.seconds * 1000;
      else startMs = new Date(startTimeRaw).getTime();

      const updateTimer = () => {
        const elapsedSec = Math.min(Math.max(0, (Date.now() - startMs) / 1000), MINING_DURATION_SEC);
        setTimeLeft(Math.max(0, MINING_DURATION_SEC - elapsedSec));
        setProgress((elapsedSec / MINING_DURATION_SEC) * 100);
      };
      
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(0); 
      setProgress(0);
    }
    
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [miningData?.mining?.isActive, miningData?.mining?.startTime]);

  const formatTime = useCallback((sec: number) => {
    if (isNaN(sec) || sec < 0) return '00:00:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }, []);

  // ✅ FIXED: Handle Start Mining dengan anti-double click
  const handleStartMining = useCallback(async () => {
    // 1. Validasi: Jangan mulai jika sedang mining atau sedang processing
    if (miningData?.mining?.isActive) {
      Alert.alert('⚠️ Mining Sudah Aktif', 'Anda masih dalam sesi mining. Silakan claim setelah waktu selesai.');
      return;
    }

    if (isProcessing) {
      console.log('[DASHBOARD] Mining already processing, ignoring click');
      return;
    }

    // 2. Set processing state
    setIsProcessing(true);

    try {
      // 3. Start mining
      await startMining();
      
      // 4. Success feedback
      console.log('[DASHBOARD] Mining started successfully');
      Alert.alert('✅ Mining Dimulai', `Sesi mining Anda telah aktif selama ${MINING_DURATION_SEC / 3600} jam.`);
    } catch (error) {
      console.error('[DASHBOARD] Failed to start mining:', error);
      Alert.alert('❌ Error', 'Gagal memulai mining. Silakan coba lagi.');
    } finally {
      // 5. Reset processing state (akan di-override oleh miningData update)
      setTimeout(() => setIsProcessing(false), 1000);
    }
  }, [miningData?.mining?.isActive, isProcessing, startMining]);

  // Boost handlers dengan feedback
  const handleStandardBoost = useCallback(() => {
    if (miningData?.isNormalBoostActive) return;
    const shown = showStandardAd();
    if (!shown) Alert.alert('Memuat Iklan...', 'Iklan sedang disiapkan. Coba lagi sebentar.', [{ text: 'OK' }]);
  }, [miningData?.isNormalBoostActive, showStandardAd]);

  const handlePremiumBoost = useCallback(() => {
    if (miningData?.isPremiumBoostActive) return;
    if ((miningData?.calculatedBalance || 0) < 14) {
      Alert.alert('Saldo Tidak Cukup', 'Butuh minimal 14 ASH untuk Premium Boost.');
      return;
    }
    const shown = showPremiumAd();
    if (!shown) Alert.alert('Memuat Iklan...', 'Iklan sedang disiapkan. Coba lagi sebentar.', [{ text: 'OK' }]);
  }, [miningData?.isPremiumBoostActive, miningData?.calculatedBalance, showPremiumAd]);

  const isMining = !!miningData?.mining?.isActive;
  const balance = displayBalance;
  const statusColor = isMining
    ? (miningData?.isNormalBoostActive || miningData?.isPremiumBoostActive ? '#ef4444' : '#10b981')
    : '#94a3b8';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{t('dashboard.greeting')}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{userMeta?.displayName || 'Miner'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarBtn}>
            <Image source={{ uri: userMeta?.photoURL || 'https://via.placeholder.com/100' }} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>

        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.balanceCard}>
          <Text style={[styles.label, { color: '#64748b' }]}>{t('dashboard.balance_label')}</Text>
          <Text style={[styles.balance, { color: '#fbbf24' }]}>
            {isNaN(balance) ? '0.000000' : balance.toFixed(6)}
          </Text>
          <Text style={[styles.currency, { color: '#00f2ff' }]}>{t('dashboard.mainnet_asset')}</Text>
        </LinearGradient>

        <View style={styles.orbWrapper}>
          <TouchableOpacity onPress={() => setShowDiagnostic(true)} style={styles.infoButton}>
            <Info size={18} color="#00f2ff" />
          </TouchableOpacity>
          <Animated.View style={[styles.glow, { backgroundColor: statusColor, opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.2] }) }]} />
          <View style={[styles.orb, { borderColor: statusColor }]}>
            <Animated.View style={{ transform: [{ rotate: spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
              <Cpu size={50} color={statusColor} />
            </Animated.View>
            <Text style={[styles.hashLabel, { color: statusColor }]}>{t('dashboard.hashrate')}</Text>
            <Text style={[styles.hashrateValue, { color: statusColor }]}>{(miningData?.currentHashrate || 0).toFixed(4)}</Text>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* ✅ FIXED: Main Button dengan anti-double click & loading state */}
        <TouchableOpacity
          style={[
            styles.mainBtn, 
            (isMining || isProcessing) && { backgroundColor: '#334155', opacity: 0.7 }
          ]}
          onPress={isMining ? claimMining : handleStartMining}
          disabled={isMining || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#0f172a" />
          ) : isMining ? (
            <Pause size={22} color="#fff" />
          ) : (
            <Play size={22} color="#0f172a" />
          )}
          
          <Text style={[styles.mainBtnText, (isMining || isProcessing) && { color: '#fff' }]}>
            {isProcessing 
              ? 'PROCESSING...' 
              : isMining 
                ? t('dashboard.claim_mined') 
                : t('dashboard.mine_now')
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dailyBtn, hasClaimedToday && styles.dailyBtnDisabled]}
          onPress={() => {
            if (!hasClaimedToday) {
              claimDailyBonus();
              setHasClaimedToday(true);
              Alert.alert(t('dashboard.bonus_alert_title'), t('dashboard.bonus_alert_msg'), [{ text: t('dashboard.bonus_alert_btn') }]);
            }
          }}
          disabled={hasClaimedToday}
        >
          <Gift size={20} color={hasClaimedToday ? '#64748b' : '#fff'} />
          <Text style={[styles.dailyBtnText, hasClaimedToday && { color: '#64748b' }]}>
            {hasClaimedToday ? t('dashboard.daily_claimed') : t('dashboard.claim_daily')}
          </Text>
        </TouchableOpacity>

        {/* BOOST SECTION */}
        <View style={styles.boostRow}>
          {/* Standard Boost */}
          <TouchableOpacity
            style={[styles.boostCard, miningData?.isNormalBoostActive && styles.boostCardActive, isStandardAdLoading && !miningData?.isNormalBoostActive && styles.boostCardLoading]}
            onPress={handleStandardBoost}
            disabled={miningData?.isNormalBoostActive}
          >
            <Zap size={20} color="#fbbf24" />
            <View style={{ flex: 1 }}>
              <Text style={styles.boostName}>{t('dashboard.standard_boost')}</Text>
              {isStandardAdLoading && !miningData?.isNormalBoostActive && (
                <Text style={styles.boostSubText}>Memuat iklan...</Text>
              )}
              {!isStandardAdLoading && !isStandardAdLoaded && !miningData?.isNormalBoostActive && (
                <Text style={styles.boostSubText}>Tap untuk coba lagi</Text>
              )}
            </View>
            {isStandardAdLoading && !miningData?.isNormalBoostActive
              ? <ActivityIndicator size="small" color="#fbbf24" />
              : <Text style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                  {miningData?.isNormalBoostActive ? t('dashboard.active') : t('dashboard.free')}
                </Text>
            }
          </TouchableOpacity>

          {/* Premium Boost */}
          <TouchableOpacity
            style={[styles.boostCard, { marginTop: 12 }, miningData?.isPremiumBoostActive && styles.boostCardActivePremium, isPremiumAdLoading && !miningData?.isPremiumBoostActive && styles.boostCardLoading]}
            onPress={handlePremiumBoost}
            disabled={miningData?.isPremiumBoostActive}
          >
            <Crown size={20} color="#00f2ff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.boostName}>{t('dashboard.premium_boost')}</Text>
              {isPremiumAdLoading && !miningData?.isPremiumBoostActive && (
                <Text style={styles.boostSubText}>Memuat iklan...</Text>
              )}
              {!isPremiumAdLoading && !isPremiumAdLoaded && !miningData?.isPremiumBoostActive && (
                <Text style={styles.boostSubText}>Tap untuk coba lagi</Text>
              )}
            </View>
            {isPremiumAdLoading && !miningData?.isPremiumBoostActive
              ? <ActivityIndicator size="small" color="#00f2ff" />
              : <Text style={{ color: '#00f2ff', fontWeight: 'bold' }}>
                  {miningData?.isPremiumBoostActive ? t('dashboard.active') : '14 ASH'}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={__DEV__ ? TestIds.BANNER : AD_IDS.bannerMarket}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={AD_REQUEST_OPTIONS}
        />
      </View>

      <MiningDiagnosticModal
        visible={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
        hashrate={miningData?.currentHashrate || 0}
        isBoostActive={!!(miningData?.isNormalBoostActive || miningData?.isPremiumBoostActive)}
        boostMultiplier={miningData?.isNormalBoostActive || miningData?.isPremiumBoostActive ? 0.5 : 0}
        teamRewardPercent={0}
      />

      <OnboardingModal
        visible={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fbbf24', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  balanceCard: { borderRadius: 20, padding: 20, marginBottom: 25 },
  label: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  balance: { fontSize: 32, fontWeight: '800' },
  currency: { fontSize: 12, fontWeight: 'bold' },
  orbWrapper: { width: '100%', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  orb: { width: width * 0.6, height: width * 0.6, borderRadius: 999, borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' },
  glow: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: 999 },
  hashLabel: { fontSize: 10, letterSpacing: 2, marginTop: 10 },
  hashrateValue: { fontSize: 28, fontWeight: 'bold' },
  timerText: { fontSize: 16, fontFamily: 'monospace', color: '#fff', marginTop: 5 },
  mainBtn: { flexDirection: 'row', backgroundColor: '#fbbf24', padding: 18, borderRadius: 15, justifyContent: 'center', alignItems: 'center', gap: 10 },
  mainBtnText: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  dailyBtn: { flexDirection: 'row', backgroundColor: '#10b981', padding: 18, borderRadius: 15, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 15 },
  dailyBtnDisabled: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1 },
  dailyBtnText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  boostRow: { marginTop: 25 },
  boostCard: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 15, borderRadius: 12, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#334155' },
  boostCardActive: { borderColor: '#fbbf24', backgroundColor: '#1a2a1a' },
  boostCardActivePremium: { borderColor: '#00f2ff', backgroundColor: '#0f1f2f' },
  boostCardLoading: { opacity: 0.7 },
  boostName: { color: '#fff', fontWeight: 'bold' },
  boostSubText: { color: '#64748b', fontSize: 11, marginTop: 2 },
  infoButton: { position: 'absolute', top: 0, right: 10, zIndex: 10, backgroundColor: '#0f172a', padding: 8, borderRadius: 10 },
  bannerContainer: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center' },
});