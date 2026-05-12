import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Copy,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  TrendingUp,
  PiggyBank,
} from 'lucide-react-native';

interface WalletData {
  fundingBalance: string;
  tradingBalance: string;
  totalBalance: string;
  isFundingLocked: boolean;
}

export default function WalletScreen() {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData>({
    fundingBalance: '0.00',
    tradingBalance: '0.00',
    totalBalance: '0.00',
    isFundingLocked: true,
  });
  const [showBalances, setShowBalances] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'funding' | 'trading'>('all');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      // Mock data - Replace with actual data from your backend
      setWalletData({
        fundingBalance: '250.00',
        tradingBalance: '984.56',
        totalBalance: '1,234.56',
        isFundingLocked: true,
      });
    } catch (error) {
      console.log('Error loading wallet data:', error);
    }
  };

  const copyAddress = () => {
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  const handleDeposit = () => {
    router.push('/(main)/buy');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw', 'Withdraw feature coming soon');
  };

  const handleTransfer = () => {
    Alert.alert('Transfer', 'Transfer between wallets coming soon');
  };

  const renderTab = (tab: 'all' | 'funding' | 'trading', title: string, balance: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, selectedTab === tab && styles.tabActive]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabTitle, selectedTab === tab && styles.tabTitleActive]}>
        {title}
      </Text>
      <Text style={[styles.tabBalance, selectedTab === tab && styles.tabBalanceActive]}>
        {showBalances ? `${balance} ASH` : '••••••'}
      </Text>
    </TouchableOpacity>
  );

  const renderTransaction = (tx: any, index: number) => (
    <View key={index} style={styles.transactionItem}>
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
      <Text style={[styles.txAmount, { color: tx.type === 'in' ? '#4caf50' : '#f44336' }]}>
        {tx.amount}
      </Text>
    </View>
  );

  const transactions = [
    { title: 'Staking Reward', type: 'in', amount: '+12.50 ASH', date: 'Today, 09:30' },
    { title: 'Task Completed', type: 'in', amount: '+5.00 ASH', date: 'Today, 08:15' },
    { title: 'Stake Deposit', type: 'out', amount: '-50.00 ASH', date: 'Yesterday' },
    { title: 'Referral Bonus', type: 'in', amount: '+2.50 ASH', date: '2 days ago' },
    { title: 'Buy ASH', type: 'in', amount: '+100.00 ASH', date: '3 days ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={() => setShowBalances(!showBalances)}>
            {showBalances ? (
              <EyeOff size={24} color="#1c1c1e" />
            ) : (
              <Eye size={24} color="#1c1c1e" />
            )}
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            {showBalances ? walletData.totalBalance : '••••••'} ASH
          </Text>
          
          {/* Wallet Tabs */}
          <View style={styles.tabs}>
            {renderTab('all', 'All', walletData.totalBalance)}
            {renderTab('funding', 'Funding', walletData.fundingBalance)}
            {renderTab('trading', 'Trading', walletData.tradingBalance)}
          </View>

          {/* Lock Notice for Funding Wallet */}
          {walletData.isFundingLocked && (
            <View style={styles.lockNotice}>
              <Lock size={14} color="#ffffff" />
              <Text style={styles.lockText}>Funding wallet locked from mining app</Text>
            </View>
          )}
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              style={styles.actionIconBg}
            >
              <ArrowDownLeft size={22} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWithdraw}>
            <LinearGradient
              colors={['#f5576c', '#f44336']}
              style={styles.actionIconBg}
            >
              <ArrowUpRight size={22} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTransfer}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.actionIconBg}
            >
              <TrendingUp size={22} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <PiggyBank size={24} color="#667eea" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Active Stakes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TrendingUp size={24} color="#4caf50" />
            <Text style={styles.statValue}>89.45</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>

        {/* Wallet Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Wallet size={20} color="#667eea" />
            <Text style={styles.addressTitle}>ASH Wallet Address</Text>
          </View>
          <View style={styles.addressRow}>
            <Text style={styles.addressText} numberOfLines={1}>
              0x1234...5678...ABCD...EFGH
            </Text>
            <TouchableOpacity onPress={copyAddress}>
              <Copy size={18} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsCard}>
            {transactions.slice(0, 4).map(renderTransaction)}
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
  balanceLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 8,
    letterSpacing: -1,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#ffffff',
  },
  tabTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  tabTitleActive: {
    color: '#667eea',
  },
  tabBalance: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 2,
  },
  tabBalanceActive: {
    color: '#1c1c1e',
  },
  lockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 6,
  },
  lockText: {
    fontSize: 12,
    color: '#ffffff',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#8e8e93',
    fontFamily: 'monospace',
    flex: 1,
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
});
