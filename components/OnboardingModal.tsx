// components/OnboardingModal.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Modal, Dimensions, Animated, Image
} from 'react-native';
import { X, ChevronRight, Zap, Gift, ShieldCheck, Send, Wallet, Users } from 'lucide-react-native';
import { useSettingsStore, themes } from '../src/stores/useSettingsStore';

const { width } = Dimensions.get('window');

const ONBOARDING_EN = [
  {
    icon: '⛏️',
    title: 'Welcome to ASH Protocol',
    desc: 'Start earning ASH coins through mining. Every tap counts — your journey to financial freedom begins here!',
    color: '#fbbf24',
  },
  {
    icon: '⏱️',
    title: 'Mining Sessions (6 Hours)',
    desc: 'Start a mining session and earn ASH over 6 hours. Mining auto-completes when time is up. Claim your rewards anytime!',
    color: '#fbbf24',
  },
  {
    icon: '🚀',
    title: 'Boost Your Earnings',
    desc: 'Watch an ad to activate a 30-min Standard Boost (+50% hashrate), or use 14 ASH for a 7-day Premium Boost.',
    color: '#00f2ff',
  },
  {
    icon: '🎁',
    title: 'Daily Bonus',
    desc: 'Claim your free 0.005 ASH bonus every day. Just tap the green Gift button on the Dashboard!',
    color: '#00ff88',
  },
  {
    icon: '👥',
    title: 'Invite & Earn',
    desc: 'Share your referral code with friends. When they join using your code, you both get bonuses!',
    color: '#a78bfa',
  },
  {
    icon: '💸',
    title: 'Send & Receive ASH',
    desc: 'After KYC verification, you can send ASH to other users with a tiny gas fee (0.001 ASH). Cheap & fast!',
    color: '#fb923c',
  },
  {
    icon: '🔒',
    title: 'Secure Your Account',
    desc: 'Enable Biometric Login and 2FA in your Profile settings to keep your ASH safe from unauthorized access.',
    color: '#34d399',
  },
  {
    icon: '🌐',
    title: 'ASH Ecosystem',
    desc: 'Explore ASH Staking, P2P trading, and more coming soon. Your ASH grows in value with the ecosystem!',
    color: '#60a5fa',
  },
];

const ONBOARDING_ID = [
  {
    icon: '⛏️',
    title: 'Selamat Datang di ASH Protocol',
    desc: 'Mulai earning ASH coins melalui mining. Setiap tap dihitung — perjalananmu menuju kebebasan finansial dimulai di sini!',
    color: '#fbbf24',
  },
  {
    icon: '⏱️',
    title: 'Sesi Mining (6 Jam)',
    desc: 'Mulai sesi mining dan dapatkan ASH selama 6 jam. Mining otomatis selesai saat waktu habis. Klaim rewards kapan saja!',
    color: '#fbbf24',
  },
  {
    icon: '🚀',
    title: 'Tingkatkan Earning',
    desc: 'Tonton iklan untuk aktifkan Standard Boost 30 menit (+50% hashrate), atau gunakan 14 ASH untuk Premium Boost 7 hari.',
    color: '#00f2ff',
  },
  {
    icon: '🎁',
    title: 'Bonus Harian',
    desc: 'Klaim bonus gratis 0.005 ASH setiap hari. Tinggal tap tombol Gift hijau di Dashboard!',
    color: '#00ff88',
  },
  {
    icon: '👥',
    title: 'Undang & Dapat',
    desc: 'Bagikan kode referral kamu ke teman. Saat mereka daftar pakai kode kamu, kalian berdua dapat bonus!',
    color: '#a78bfa',
  },
  {
    icon: '💸',
    title: 'Kirim & Terima ASH',
    desc: 'Setelah verifikasi KYC, kamu bisa kirim ASH ke user lain dengan gas fee kecil (0.001 ASH). Murah & cepat!',
    color: '#fb923c',
  },
  {
    icon: '🔒',
    title: 'Amankan Akunmu',
    desc: 'Aktifkan Biometric Login dan 2FA di pengaturan Profil untuk menjaga ASH kamu dari akses yang tidak sah.',
    color: '#34d399',
  },
  {
    icon: '🌐',
    title: 'Ekosistem ASH',
    desc: 'Jelajahi ASH Staking, trading P2P, dan fitur lainnya yang segera hadir. ASH kamu bertumbuh seiring ekosistem!',
    color: '#60a5fa',
  },
];

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ visible, onClose }: OnboardingModalProps) {
  const { language, theme } = useSettingsStore();
  const colors = themes[theme];
  const pages = language === 'id' ? ONBOARDING_ID : ONBOARDING_EN;
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentPage + 1) * width, animated: true });
      setCurrentPage(currentPage + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const isLastPage = currentPage === pages.length - 1;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Skip Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              {language === 'id' ? 'Lewati' : 'Skip'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ width: width * pages.length }}
        >
          {pages.map((page, index) => (
            <View key={index} style={[styles.slide, { width }]}>
              <View style={[styles.iconCircle, { backgroundColor: page.color + '20' }]}>
                <Text style={styles.iconEmoji}>{page.icon}</Text>
              </View>
              <Text style={[styles.slideTitle, { color: colors.text }]}>{page.title}</Text>
              <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{page.desc}</Text>
              <View style={[styles.progressDots, { marginTop: 32 }]}>
                {pages.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: i === currentPage ? page.color : colors.border,
                        width: i === currentPage ? 24 : 8,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
        </Animated.ScrollView>

        {/* Bottom Buttons */}
        <View style={[styles.footer, { paddingBottom: 40 }]}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: pages[currentPage]?.color || colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {isLastPage
                ? (language === 'id' ? 'Mulai Mining! ⛏️' : 'Start Mining! ⛏️')
                : (language === 'id' ? 'Lanjut' : 'Next')}
            </Text>
            {!isLastPage && <ChevronRight size={20} color="#0f172a" />}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 60, paddingHorizontal: 24 },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 15, fontWeight: '500' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  iconEmoji: { fontSize: 48 },
  slideTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  slideDesc: { fontSize: 16, textAlign: 'center', lineHeight: 26, paddingHorizontal: 8 },
  progressDots: { flexDirection: 'row', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingTop: 20 },
  nextBtn: { flexDirection: 'row', padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextBtnText: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
});
