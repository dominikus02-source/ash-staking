// app/(main)/team.tsx
// FIX: Ganti user?.uid → uid dari useAuthStore
// FIX: Tambah firebaseAuthReady check sebelum query Firestore

import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BarChart3, Copy, Crown, Gift, TrendingUp, UserPlus, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { auth, db } from '../../src/lib/firebase';
import { useAuthStore } from '../../src/stores/useAuthStore';

interface MemberData {
  uid: string;
  displayName?: string;
  email?: string;
  joinedAt?: number;
  isMining?: boolean;
}

export default function TeamScreen() {
  const { colors } = useTheme();
  // FIX: pakai uid, bukan user
  const { uid } = useAuthStore();

  const [members, setMembers] = useState<MemberData[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  const myReferralCode = uid ? uid.substring(0, 6).toUpperCase() : '------';

  // FIX: Tunggu Firebase Auth ready sebelum query
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseReady(!!firebaseUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid || !firebaseReady) return;

    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'users'), where('referredBy', '==', uid));
        const snapshot = await getDocs(q);

        const teamList: MemberData[] = [];
        let commissionSum = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          teamList.push({
            uid: doc.id,
            displayName: data.displayName || data.email?.split('@')[0] || 'User',
            email: data.email,
            joinedAt: data.createdAt,
            isMining: data.mining?.isActive,
          });
          commissionSum += (data.balance || 0) * 0.05;
        });

        setMembers(teamList);
        setTotalCommission(commissionSum);
      } catch (error: any) {
        console.error('Error fetching team:', error);
        if (error.code !== 'permission-denied') {
          Alert.alert('Error', 'Gagal memuat data tim');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [uid, firebaseReady]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my ASH Protocol Syndicate! Use code ${myReferralCode} to start mining together and earn rewards.`,
        title: 'Join ASH Protocol',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const getRank = () => {
    const count = members.length;
    if (count >= 50) return { title: 'LEGENDARY', color: '#fbbf24', icon: <Crown size={20} color="#fbbf24" /> };
    if (count >= 20) return { title: 'GOLD', color: '#fbbf24', icon: <Users size={20} color="#fbbf24" /> };
    if (count >= 5) return { title: 'SILVER', color: '#94a3b8', icon: <UserPlus size={20} color="#94a3b8" /> };
    return { title: 'BRONZE', color: '#64748b', icon: <UserPlus size={20} color="#64748b" /> };
  };

  const rank = getRank();

  if (loading) {
    return (
      <SafeAreaView style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>LOADING SYNDICATE...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>SYNDICATE</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Build Your Network</Text>
        </View>

        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.rankCard}>
          <View style={styles.rankHeader}>
            {rank.icon}
            <Text style={[styles.rankTitle, { color: rank.color }]}>RANK: {rank.title}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{members.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Members</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{members.filter(m => m.isMining).length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Miners</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#00ff88' }]}>{totalCommission.toFixed(4)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Comm. Earned</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.referralSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Invite Code</Text>
          <View style={[styles.codeBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.codeText, { color: colors.primary }]}>{myReferralCode}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Copied!', `Code ${myReferralCode} copied`)}>
              <Copy size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Gift size={18} color="#0f172a" />
            <Text style={styles.shareBtnText}>SHARE INVITE LINK</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commissionSection}>
          <View style={styles.commissionHeader}>
            <BarChart3 size={20} color="#00ff88" />
            <Text style={[styles.commissionTitle, { color: colors.text }]}>Live Commission</Text>
          </View>
          <View style={[styles.commissionCard, { backgroundColor: colors.card, borderColor: '#00ff88' }]}>
            <Text style={[styles.commissionDesc, { color: colors.textSecondary }]}>You earn 5% of your team's daily mining rewards.</Text>
            <Text style={styles.commissionAmount}>+{totalCommission.toFixed(4)} ASH</Text>
          </View>
        </View>

        <View style={styles.membersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Network</Text>
          {members.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <UserPlus size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No members yet. Invite friends!</Text>
            </View>
          ) : (
            members.map((member) => (
              <View key={member.uid} style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.memberAvatar, { backgroundColor: colors.border }]}>
                  <Text style={[styles.avatarText, { color: colors.text }]}>{member.displayName?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.memberName, { color: colors.text }]}>{member.displayName}</Text>
                  <Text style={[styles.memberStatus, { color: member.isMining ? '#00ff88' : colors.textSecondary }]}>
                    {member.isMining ? '⚡ Mining Active' : '💤 Idle'}
                  </Text>
                </View>
                <View style={styles.memberEarning}>
                  <TrendingUp size={14} color={colors.primary} />
                  <Text style={[styles.earningText, { color: colors.primary }]}>Active</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: '#64748b' },
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4 },
  rankCard: { borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#334155' },
  rankHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  rankTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  divider: { width: 1, height: 40 },
  referralSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  codeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  codeText: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  shareBtn: { flexDirection: 'row', backgroundColor: '#fbbf24', paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  shareBtnText: { color: '#0f172a', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  commissionSection: { marginBottom: 24 },
  commissionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  commissionTitle: { fontSize: 18, fontWeight: '700' },
  commissionCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  commissionDesc: { fontSize: 12, marginBottom: 8 },
  commissionAmount: { fontSize: 20, fontWeight: '800', color: '#00ff88' },
  membersSection: { marginBottom: 20 },
  emptyState: { padding: 30, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 14 },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontWeight: '700' },
  memberName: { fontSize: 16, fontWeight: '600' },
  memberStatus: { fontSize: 12, marginTop: 2 },
  memberEarning: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  earningText: { fontSize: 12, fontWeight: '700' },
});