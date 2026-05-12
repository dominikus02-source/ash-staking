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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Users,
  ChevronRight,
  Bell,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Star,
  Gift,
  Activity,
  BarChart3,
  RefreshCw,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

interface Transaction {
  id: string;
  title: string;
  type: 'in' | 'out';
  amount: string;
  date: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('User');
  const [balance, setBalance] = useState('0.00');
  const [totalEarned, setTotalEarned] = useState('0.00');
  
  const balanceAnim = new Animated.Value(0);

  useEffect(() => {
    loadUserData();
    Animated.timing(balanceAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
      // Mock data - Replace with actual data from your backend
      setBalance('1,234.56');
      setTotalEarned('89.45');
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
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

  const recentTransactions: Transaction[] = [
    { id: '1', title: 'Staking Reward', type: 'in', amount: '+12.50 ASH', date: 'Today, 09:30' },
    { id: '2', title: 'Task Completed', type: 'in', amount: '+5.00 ASH', date: 'Today, 08:15' },
    { id: '3', title: 'Stake Deposit', type: 'out', amount: '-50.00 ASH', date: 'Yesterday' },
    { id: '4', title: 'Referral Bonus', type: 'in', amount: '+2.50 ASH', date: '2 days ago' },
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

  const renderTransaction = (tx: Transaction) => (
    <View key={tx.id} style={styles.transactionItem}>
      <View style={[
        styles.txIcon,
        { backgroundColor: tx.type === 'in' ? '#e8f5e9' : '#ffebee' }
      ]}>
        {tx.type === 'in' ? (
          <ArrowDownLeft size={20} color="#4caf50" />
        ) : (
          <ArrowUpRight size={20} color="#f44336" />
        )}
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{tx.title}</Text>
        <Text style={styles.txDate}>{tx.date}</Text>
      </View>
      <Text style={[
        styles.txAmount,
        { color: tx.type === 'in' ? '#4caf50' : '#f44336' }
      ]}>
        {tx.amount}
      </Text>
    </View>
  );

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
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={24} color="#1c1c1e" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
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
            <Text style={styles.balanceAmount}>{balance}</Text>
            <Text style={styles.balanceCurrency}>ASH</Text>
          </Animated.View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>{totalEarned} ASH</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Active Stakes</Text>
              <Text style={styles.statValue}>3</Text>
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsCard}>
            {recentTransactions.map(renderTransaction)}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance</Text>
          </View>
          <View style={styles.statsCard}>
            <View style={styles.performanceItem}>
              <BarChart3 size={24} color="#667eea" />
              <Text style={styles.performanceValue}>22%</Text>
              <Text style={styles.performanceLabel}>Best APY</Text>
            </View>
            <View style={styles.performanceItem}>
              <Activity size={24} color="#4facfe" />
              <Text style={styles.performanceValue}>$1.23</Text>
              <Text style={styles.performanceLabel}>ASH Price</Text>
            </View>
            <View style={styles.performanceItem}>
              <Star size={24} color="#f093fb" />
              <Text style={styles.performanceValue}>5</Text>
              <Text style={styles.performanceLabel}>Referrals</Text>
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
  greeting: {
    fontSize: 15,
    color: '#8e8e93',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
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
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  statDivider: {
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
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  txDate: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 8,
  },
  performanceLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
});
