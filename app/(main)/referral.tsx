import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Gift,
  Copy,
  ChevronRight,
  Star,
  TrendingUp,
  Award,
  MessageSquare,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ReferralStats {
  totalInvited: number;
  activeReferrals: number;
  totalCommission: string;
  pendingCommission: string;
}

interface ReferralTier {
  level: number;
  name: string;
  commission: number;
  minReferrals: number;
  color: string;
}

const REFERRAL_TIERS: ReferralTier[] = [
  { level: 1, name: 'Bronze', commission: 5, minReferrals: 0, color: '#cd7f32' },
  { level: 2, name: 'Silver', commission: 7, minReferrals: 5, color: '#c0c0c0' },
  { level: 3, name: 'Gold', commission: 10, minReferrals: 15, color: '#ffd700' },
  { level: 4, name: 'Platinum', commission: 12, minReferrals: 30, color: '#e5e4e2' },
  { level: 5, name: 'Diamond', commission: 15, minReferrals: 50, color: '#b9f2ff' },
];

export default function ReferralScreen() {
  const [stats] = useState<ReferralStats>({
    totalInvited: 12,
    activeReferrals: 8,
    totalCommission: '45.60',
    pendingCommission: '8.25',
  });

  const [currentTier] = useState<ReferralTier>(REFERRAL_TIERS[1]);
  const referralCode = 'ASH7X9K';

  const handleCopyCode = () => {
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join ASH STAKING and earn up to 22% APY on your staking! Use my referral code: ${referralCode}\n\nDownload now: https://ashstaking.app/download`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleInvite = () => {
    Alert.alert('Invite Friends', 'Choose how to share your referral code:', [
      { text: 'Copy Code', onPress: handleCopyCode },
      { text: 'Share Link', onPress: handleShare },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const referrals = [
    { id: '1', name: 'John D.', date: '2 days ago', commission: '5.00', status: 'active' },
    { id: '2', name: 'Sarah M.', date: '1 week ago', commission: '3.50', status: 'active' },
    { id: '3', name: 'Mike R.', date: '2 weeks ago', commission: '2.25', status: 'pending' },
    { id: '4', name: 'Emma L.', date: '3 weeks ago', commission: '4.00', status: 'active' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Referral</Text>
          <View style={styles.tierBadge}>
            <Award size={16} color={currentTier.color} />
            <Text style={[styles.tierText, { color: currentTier.color }]}>
              {currentTier.name}
            </Text>
          </View>
        </View>

        {/* Main Referral Card */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <View style={styles.mainCardContent}>
            <View style={styles.iconContainer}>
              <Users size={32} color="#ffffff" />
            </View>
            <Text style={styles.mainTitle}>Invite & Earn</Text>
            <Text style={styles.mainSubtitle}>
              Earn {currentTier.commission}% commission on every staking your referrals make
            </Text>

            {/* Referral Code */}
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Your Referral Code</Text>
              <TouchableOpacity 
                style={styles.codeBox}
                onPress={handleCopyCode}
              >
                <Text style={styles.codeText}>{referralCode}</Text>
                <Copy size={18} color="#667eea" />
              </TouchableOpacity>
            </View>

            {/* Share Button */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <LinearGradient
                colors={['#ffffff', '#f0f0ff']}
                style={styles.shareButtonGradient}
              >
                <MessageSquare size={20} color="#667eea" />
                <Text style={styles.shareButtonText}>Invite Friends</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#667eea" />
            <Text style={styles.statValue}>{stats.totalInvited}</Text>
            <Text style={styles.statLabel}>Invited</Text>
          </View>
          <View style={styles.statCard}>
            <Star size={24} color="#ffd700" />
            <Text style={styles.statValue}>{stats.activeReferrals}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#4caf50" />
            <Text style={styles.statValue}>{stats.totalCommission}</Text>
            <Text style={styles.statLabel}>Earned ASH</Text>
          </View>
        </View>

        {/* Commission Section */}
        <View style={styles.commissionCard}>
          <View style={styles.commissionHeader}>
            <Gift size={20} color="#4caf50" />
            <Text style={styles.commissionTitle}>Commission Earnings</Text>
          </View>
          <View style={styles.commissionDetails}>
            <View style={styles.commissionItem}>
              <Text style={styles.commissionLabel}>Total Earned</Text>
              <Text style={styles.commissionValue}>{stats.totalCommission} ASH</Text>
            </View>
            <View style={styles.commissionDivider} />
            <View style={styles.commissionItem}>
              <Text style={styles.commissionLabel}>Pending</Text>
              <Text style={[styles.commissionValue, { color: '#ff9500' }]}>
                {stats.pendingCommission} ASH
              </Text>
            </View>
          </View>
        </View>

        {/* Commission Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commission Tiers</Text>
          <View style={styles.tiersCard}>
            {REFERRAL_TIERS.map((tier, index) => (
              <View 
                key={tier.level}
                style={[
                  styles.tierItem,
                  tier.level <= currentTier.level && styles.tierItemActive
                ]}
              >
                <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
                <View style={styles.tierInfo}>
                  <Text style={[
                    styles.tierName,
                    tier.level <= currentTier.level && styles.tierNameActive
                  ]}>
                    {tier.name}
                  </Text>
                  <Text style={styles.tierRequirement}>
                    {tier.minReferrals}+ referrals
                  </Text>
                </View>
                <Text style={[
                  styles.tierCommission,
                  tier.level <= currentTier.level && styles.tierCommissionActive
                ]}>
                  {tier.commission}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Referrals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Referrals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.referralsCard}>
            {referrals.map((ref) => (
              <View key={ref.id} style={styles.referralItem}>
                <View style={styles.referralAvatar}>
                  <Text style={styles.avatarText}>
                    {ref.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>{ref.name}</Text>
                  <Text style={styles.referralDate}>{ref.date}</Text>
                </View>
                <View style={styles.referralEarnings}>
                  <Text style={styles.referralCommission}>+{ref.commission} ASH</Text>
                  <View style={[
                    styles.statusBadge,
                    ref.status === 'active' ? styles.statusActive : styles.statusPending
                  ]}>
                    <Text style={styles.statusText}>
                      {ref.status === 'active' ? 'Active' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.howItWorksCard}>
            <View style={styles.howItem}>
              <View style={styles.howNumber}>
                <Text style={styles.howNumberText}>1</Text>
              </View>
              <View style={styles.howContent}>
                <Text style={styles.howTitle}>Share Your Code</Text>
                <Text style={styles.howDescription}>
                  Share your unique referral code with friends
                </Text>
              </View>
            </View>
            <View style={styles.howItem}>
              <View style={styles.howNumber}>
                <Text style={styles.howNumberText}>2</Text>
              </View>
              <View style={styles.howContent}>
                <Text style={styles.howTitle}>Friend Signs Up</Text>
                <Text style={styles.howDescription}>
                  They register using your referral code
                </Text>
              </View>
            </View>
            <View style={styles.howItem}>
              <View style={styles.howNumber}>
                <Text style={styles.howNumberText}>3</Text>
              </View>
              <View style={styles.howContent}>
                <Text style={styles.howTitle}>Earn Commission</Text>
                <Text style={styles.howDescription}>
                  Get {currentTier.commission}% on their staking rewards
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mainCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mainCardContent: {
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: 2,
  },
  shareButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#667eea',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
  commissionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  commissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  commissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  commissionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commissionItem: {
    flex: 1,
  },
  commissionLabel: {
    fontSize: 13,
    color: '#8e8e93',
  },
  commissionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4caf50',
    marginTop: 4,
  },
  commissionDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  seeAll: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
  },
  tiersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  tierItemActive: {
    backgroundColor: '#f8f9ff',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  tierDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8e8e93',
  },
  tierNameActive: {
    color: '#1c1c1e',
    fontWeight: '600',
  },
  tierRequirement: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },
  tierCommission: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8e8e93',
  },
  tierCommissionActive: {
    color: '#4caf50',
  },
  referralsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  referralAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  referralDate: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  referralEarnings: {
    alignItems: 'flex-end',
  },
  referralCommission: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4caf50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4caf50',
  },
  howItWorksCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  howItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  howNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  howNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  howContent: {
    flex: 1,
  },
  howTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  howDescription: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
    lineHeight: 20,
  },
});
