import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Users,
  Bell,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Gift,
  RefreshCw,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, subscribeToUserData, signOut, UserData } from '../../src/lib/firebase';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const balanceAnim = new Animated.Value(0);

  useEffect(() => {
    const unsubscribe = subscribeToUserData(auth.currentUser?.uid || '', (data) => {
      setUserData(data);
      setLoading(false);
    });

    Animated.timing(balanceAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Data will refresh automatically via onSnapshot
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    await signOut();
    await AsyncStorage.clear();
    router.replace('/(auth)/login');
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Stake',
      subtitle: 'Earn 12-22% APY',
      icon: <PiggyBank size={24} color="#ffffff" />,
      color: '#667eea',
      route: '/(main)/staking',
    },
    {
      id: '2',
      title: 'Wallet',
      subtitle: 'Manage funds',
      icon: <Wallet size={24} color="#ffffff" />,
      color: '#4facfe',
      route: '/(main)/wallet',
    },
    {
      id: '3',
      title: 'Tasks',
      subtitle: 'Daily rewards',
      icon: <Gift size={24} color="#ffffff" />,
      color: '#f093fb',
      route: '/(main)/tasks',
    },
    {
      id: '4',
      title: 'Referral',
      subtitle: 'Invite & earn',
      icon: <Users size={24} color="#ffffff" />,
      color: '#43e97b',
      route: '/(main)/referral',
    },
    {
      id: '5',
      title: 'Buy ASH',
      subtitle: 'Purchase tokens',
      icon: <TrendingUp size={24} color="#ffffff" />,
      color: '#f5576c',
      route: '/(main)/buy',
    },
    {
      id: '6',
      title: 'History',
      subtitle: 'Transaction log',
      icon: <Clock size={24} color="#ffffff" />,
      color: '#38f9d7',
      route: '/(main)/history',
    },
  ];

  const renderQuickAction = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionCard}
      onPress={() => router.push(action.route as any)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[action.color, action.color + 'dd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionIcon}
      >
        {action.icon}
      </LinearGradient>
      <Text style={styles.actionTitle}>{action.title}</Text>
      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalBalance = (userData?.fundingBalance || 0) + (userData?.tradingBalance || 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{userData?.displayName || 'User'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={24} color="#1c1c1e" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <TouchableOpacity 
              style={styles.refreshBtn}
              onPress={onRefresh}
            >
              <RefreshCw size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <Animated.View style={{
            opacity: balanceAnim,
            transform: [{
              translateY: balanceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            }],
          }}>
            <Text style={styles.balanceAmount}>{totalBalance.toFixed(2)}</Text>
            <Text style={styles.balanceCurrency}>ASH</Text>
          </Animated.View>

          {/* Wallet Breakdown */}
          <View style={styles.walletBreakdown}>
            <View style={styles.walletItem}>
              <Wallet size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.walletLabel}>Trading</Text>
              <Text style={styles.walletValue}>{(userData?.tradingBalance || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.walletDivider} />
            <View style={styles.walletItem}>
              <TrendingUp size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.walletLabel}>Funding (Locked)</Text>
              <Text style={styles.walletValue}>{(userData?.fundingBalance || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* ASH Coin Visual */}
          <View style={styles.coinVisual}>
            <View style={styles.coinOuter}>
              <LinearGradient
                colors={['#ffd700', '#ffed4a', '#ffd700']}
                style={styles.coinInner}
              >
                <Text style={styles.coinText}>ASH</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color="#4caf50" />
            <Text style={styles.statValue}>{(userData?.totalEarned || 0).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statCard}>
            <PiggyBank size={20} color="#667eea" />
            <Text style={styles.statValue}>{userData?.stakes?.length || 0}</Text>
            <Text style={styles.statLabel}>Active Stakes</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={20} color="#43e97b" />
            <Text style={styles.statValue}>{userData?.referralCount || 0}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Staking Summary */}
        {userData?.stakes && userData.stakes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Stakes</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/staking')}>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {userData.stakes.slice(0, 2).map((stake) => (
              <View key={stake.id} style={styles.stakeCard}>
                <View style={styles.stakeInfo}>
                  <Text style={styles.stakeName}>{stake.packageName}</Text>
                  <Text style={styles.stakeAmount}>{stake.amount} ASH @ {stake.apy}%</Text>
                </View>
                <View style={styles.stakeReward}>
                  <Text style={styles.stakeRewardLabel}>Earned</Text>
                  <Text style={styles.stakeRewardValue}>{stake.claimedReward.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
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
  greeting: {
    fontSize: 15,
    color: '#8e8e93',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: '500',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -2,
  },
  balanceCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -4,
  },
  walletBreakdown: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  walletLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  walletValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  walletDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  coinVisual: {
    position: 'absolute',
    right: -30,
    top: 60,
    opacity: 0.3,
  },
  coinOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1c1c1e',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
  stakeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  stakeInfo: {},
  stakeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  stakeAmount: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  stakeReward: {
    alignItems: 'flex-end',
  },
  stakeRewardLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  stakeRewardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4caf50',
    marginTop: 4,
  },
});
