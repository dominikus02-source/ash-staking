import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  TrendingUp,
  PiggyBank,
  Banknote,
  X,
} from 'lucide-react-native';
import { auth, subscribeToUserData, signOut, UserData, updateTradingBalance, addTransaction } from '../../src/lib/firebase';

interface WalletData {
  fundingBalance: number;
  tradingBalance: number;
  totalBalance: number;
  isFundingLocked: boolean;
}

export default function WalletScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'funding' | 'trading'>('all');
  
  // Withdrawal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUserData(auth.currentUser?.uid || '', (data) => {
      setUserData(data);
    });

    return () => unsubscribe();
  }, []);

  const handleDeposit = () => {
    router.push('/(main)/buy');
  };

  const handleWithdraw = () => {
    // Check if bank account is set
    if (!(userData as any)?.bankAccount?.bankName) {
      Alert.alert(
        'Bank Account Required',
        'Please add your bank account first to withdraw funds.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Bank Account', onPress: () => router.push('/(main)/profile') },
        ]
      );
      return;
    }
    
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!auth.currentUser || !userData) return;
    
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    
    if (amount < 10) {
      Alert.alert('Error', 'Minimum withdrawal is 10 ASH.');
      return;
    }
    
    if (amount > userData.tradingBalance) {
      Alert.alert('Error', 'Insufficient balance.');
      return;
    }

    setWithdrawLoading(true);
    
    try {
      // Deduct from trading balance
      await updateTradingBalance(auth.currentUser.uid, amount, 'subtract');
      
      // Add transaction
      const bankAccount = (userData as any).bankAccount;
      await addTransaction(auth.currentUser.uid, {
        type: 'out',
        category: 'withdraw',
        title: `Withdraw to ${bankAccount.bankName} ****${bankAccount.accountNumber.slice(-4)}`,
        amount: amount,
        balanceAfter: userData.tradingBalance - amount,
        status: 'pending',
      });
      
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      Alert.alert(
        'Withdrawal Initiated',
        `Your withdrawal of ${amount} ASH is being processed. Funds will be transferred to your bank account within 1-3 business days.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process withdrawal.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const copyAddress = () => {
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  const renderTab = (tab: 'all' | 'funding' | 'trading', title: string, balance: number) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, selectedTab === tab && styles.tabActive]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[styles.tabTitle, selectedTab === tab && styles.tabTitleActive]}>
        {title}
      </Text>
      <Text style={[styles.tabBalance, selectedTab === tab && styles.tabBalanceActive]}>
        {showBalances ? `${balance.toFixed(2)} ASH` : '••••••'}
      </Text>
    </TouchableOpacity>
  );

  const totalBalance = (userData?.fundingBalance || 0) + (userData?.tradingBalance || 0);

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

  // Mock transactions for display
  const transactions = [
    { title: 'Staking Reward', type: 'in', amount: '+12.50 ASH', date: 'Today, 09:30' },
    { title: 'Task Completed', type: 'in', amount: '+5.00 ASH', date: 'Today, 08:15' },
    { title: 'Stake Deposit', type: 'out', amount: '-50.00 ASH', date: 'Yesterday' },
    { title: 'Referral Bonus', type: 'in', amount: '+2.50 ASH', date: '2 days ago' },
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
            {showBalances ? totalBalance.toFixed(2) : '••••••'} ASH
          </Text>
          
          {/* Wallet Tabs */}
          <View style={styles.tabs}>
            {renderTab('all', 'All', totalBalance)}
            {renderTab('funding', 'Funding', userData?.fundingBalance || 0)}
            {renderTab('trading', 'Trading', userData?.tradingBalance || 0)}
          </View>

          {/* Lock Notice for Funding Wallet */}
          {userData?.fundingBalance && userData.fundingBalance > 0 && (
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

          <TouchableOpacity style={styles.actionButton}>
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
            <Text style={styles.statValue}>{userData?.stakes?.length || 0}</Text>
            <Text style={styles.statLabel}>Active Stakes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TrendingUp size={24} color="#4caf50" />
            <Text style={styles.statValue}>{(userData?.totalEarned || 0).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>

        {/* Bank Account Card */}
        <TouchableOpacity style={styles.bankCard} onPress={() => router.push('/(main)/profile')}>
          <View style={styles.bankIcon}>
            <Banknote size={24} color="#667eea" />
          </View>
          <View style={styles.bankInfo}>
            <Text style={styles.bankLabel}>Bank Account</Text>
            {(userData as any)?.bankAccount?.bankName ? (
              <Text style={styles.bankValue}>
                {(userData as any).bankAccount.bankName} ****{(userData as any).bankAccount.accountNumber?.slice(-4)}
              </Text>
            ) : (
              <Text style={styles.bankEmpty}>Add bank account</Text>
            )}
          </View>
          <ChevronRight size={20} color="#c7c7cc" />
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsCard}>
            {transactions.map(renderTransaction)}
          </View>
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw ASH</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <X size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Balance Info */}
              <View style={styles.withdrawBalance}>
                <Text style={styles.withdrawBalanceLabel}>Available Balance</Text>
                <Text style={styles.withdrawBalanceValue}>
                  {userData?.tradingBalance?.toFixed(2) || '0.00'} ASH
                </Text>
              </View>

              {/* Bank Account Info */}
              <View style={styles.withdrawBank}>
                <Text style={styles.withdrawBankLabel}>To Bank Account</Text>
                <Text style={styles.withdrawBankValue}>
                  {(userData as any)?.bankAccount?.bankName} - ****{(
                    userData as any
                  )?.bankAccount?.accountNumber?.slice(-4)}
                </Text>
              </View>

              {/* Amount Input */}
              <View style={styles.amountInput}>
                <Text style={styles.inputLabel}>Amount (ASH)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#8e8e93"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.maxButton}
                    onPress={() => setWithdrawAmount((userData?.tradingBalance || 0).toString())}
                  >
                    <Text style={styles.maxText}>MAX</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputHint}>Minimum withdrawal: 10 ASH</Text>
              </View>

              {/* Warning */}
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Withdrawal will be processed within 1-3 business days. A small network fee may apply.
                </Text>
              </View>

              {/* Withdraw Button */}
              <TouchableOpacity 
                style={[styles.withdrawButton, withdrawLoading && styles.withdrawButtonDisabled]}
                onPress={handleConfirmWithdraw}
                disabled={withdrawLoading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.withdrawGradient}
                >
                  <Text style={styles.withdrawButtonText}>
                    {withdrawLoading ? 'Processing...' : 'Confirm Withdrawal'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-around',
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
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bankInfo: {
    flex: 1,
  },
  bankLabel: {
    fontSize: 13,
    color: '#8e8e93',
  },
  bankValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginTop: 2,
  },
  bankEmpty: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  modalBody: {
    padding: 20,
  },
  withdrawBalance: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  withdrawBalanceLabel: {
    fontSize: 13,
    color: '#8e8e93',
  },
  withdrawBalanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 4,
  },
  withdrawBank: {
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  withdrawBankLabel: {
    fontSize: 13,
    color: '#667eea',
  },
  withdrawBankValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginTop: 4,
  },
  amountInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 17,
    color: '#1c1c1e',
  },
  maxButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  maxText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputHint: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
  },
  warningBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 13,
    color: '#ff9500',
    lineHeight: 18,
  },
  withdrawButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
