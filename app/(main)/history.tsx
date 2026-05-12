import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Calendar,
  TrendingUp,
  Gift,
  PiggyBank,
  Users,
} from 'lucide-react-native';

interface Transaction {
  id: string;
  type: 'in' | 'out';
  category: 'staking' | 'task' | 'referral' | 'deposit' | 'withdraw' | 'transfer';
  title: string;
  amount: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}

const TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'in', category: 'staking', title: 'Staking Reward', amount: '+12.50 ASH', date: 'Today', time: '09:30 AM', status: 'completed' },
  { id: '2', type: 'in', category: 'task', title: 'Task Completed', amount: '+5.00 ASH', date: 'Today', time: '08:15 AM', status: 'completed' },
  { id: '3', type: 'out', category: 'staking', title: 'Stake Deposit', amount: '-50.00 ASH', date: 'Yesterday', time: '03:45 PM', status: 'completed' },
  { id: '4', type: 'in', category: 'referral', title: 'Referral Bonus', amount: '+2.50 ASH', date: 'Yesterday', time: '11:20 AM', status: 'completed' },
  { id: '5', type: 'in', category: 'deposit', title: 'Buy ASH', amount: '+100.00 ASH', date: '3 days ago', time: '02:30 PM', status: 'completed' },
  { id: '6', type: 'in', category: 'staking', title: 'Staking Reward', amount: '+8.75 ASH', date: '3 days ago', time: '09:00 AM', status: 'completed' },
  { id: '7', type: 'out', category: 'transfer', title: 'Transfer Out', amount: '-25.00 ASH', date: '4 days ago', time: '06:15 PM', status: 'completed' },
  { id: '8', type: 'in', category: 'task', title: 'Daily Check-in', amount: '+2.00 ASH', date: '4 days ago', time: '10:00 AM', status: 'completed' },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: null },
  { id: 'staking', name: 'Staking', icon: <PiggyBank size={16} color="#667eea" /> },
  { id: 'task', name: 'Tasks', icon: <Gift size={16} color="#f5576c" /> },
  { id: 'referral', name: 'Referral', icon: <Users size={16} color="#43e97b" /> },
];

export default function HistoryScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const filteredTransactions = TRANSACTIONS.filter((tx) => {
    if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'staking':
        return <PiggyBank size={20} color="#667eea" />;
      case 'task':
        return <Gift size={20} color="#f5576c" />;
      case 'referral':
        return <Users size={20} color="#43e97b" />;
      default:
        return <TrendingUp size={20} color="#ffd700" />;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.txIcon,
        { backgroundColor: item.type === 'in' ? '#e8f5e9' : '#ffebee' }
      ]}>
        {item.type === 'in' ? (
          <ArrowDownLeft size={20} color="#4caf50" />
        ) : (
          <ArrowUpRight size={20} color="#f44336" />
        )}
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{item.title}</Text>
        <View style={styles.txMeta}>
          {getCategoryIcon(item.category)}
          <Text style={styles.txDate}>{item.date} • {item.time}</Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: item.type === 'in' ? '#4caf50' : '#f44336' }]}>
          {item.amount}
        </Text>
        <View style={[styles.statusBadge, item.status === 'completed' && styles.statusCompleted]}>
          <Text style={[styles.statusText, item.status === 'completed' && styles.statusTextCompleted]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabs}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.filterTab, selectedCategory === cat.id && styles.filterTabActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              {cat.icon}
              <Text style={[styles.filterTabText, selectedCategory === cat.id && styles.filterTabTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date Filter */}
        <View style={styles.dateFilter}>
          <Calendar size={18} color="#8e8e93" />
          <Text style={styles.dateText}>Last 30 days</Text>
          <TouchableOpacity>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValueGreen}>+132.75 ASH</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Outcome</Text>
            <Text style={styles.summaryValueRed}>-75.00 ASH</Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {filteredTransactions.length} Transactions
          </Text>
          <View style={styles.transactionsCard}>
            {filteredTransactions.map((tx) => (
              <View key={tx.id}>
                {renderTransaction({ item: tx })}
              </View>
            ))}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  filterTabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabActive: {
    backgroundColor: '#667eea',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  dateFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: '#1c1c1e',
  },
  changeText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#8e8e93',
  },
  summaryValueGreen: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4caf50',
    marginTop: 4,
  },
  summaryValueRed: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f44336',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 12,
  },
  transactionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
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
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  txDate: {
    fontSize: 13,
    color: '#8e8e93',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'capitalize',
  },
  statusTextCompleted: {
    color: '#4caf50',
  },
});
