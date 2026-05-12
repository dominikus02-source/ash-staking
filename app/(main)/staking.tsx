import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  Clock,
  Lock,
  CheckCircle,
  ChevronRight,
  PiggyBank,
  Info,
  ArrowUpRight,
  Gift,
} from 'lucide-react-native';
import { notifyStakingComplete, scheduleStakingReminder, notifyStakingReward } from '../../src/services/notifications';

const { width } = Dimensions.get('window');

interface StakingPackage {
  id: string;
  name: string;
  duration: number;
  durationLabel: string;
  apy: number;
  minAmount: number;
  maxAmount: number;
  color: string;
  gradient: string[];
  popular?: boolean;
}

const STAKING_PACKAGES: StakingPackage[] = [
  {
    id: '1',
    name: 'Starter',
    duration: 7,
    durationLabel: '7 Days',
    apy: 12,
    minAmount: 10,
    maxAmount: 500,
    color: '#4facfe',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '2',
    name: 'Basic',
    duration: 14,
    durationLabel: '14 Days',
    apy: 14,
    minAmount: 50,
    maxAmount: 1000,
    color: '#43e97b',
    gradient: ['#43e97b', '#38f9d7'],
  },
  {
    id: '3',
    name: 'Standard',
    duration: 30,
    durationLabel: '30 Days',
    apy: 15,
    minAmount: 100,
    maxAmount: 5000,
    color: '#f093fb',
    gradient: ['#f093fb', '#f5576c'],
    popular: true,
  },
  {
    id: '4',
    name: 'Premium',
    duration: 30,
    durationLabel: '30 Days',
    apy: 18,
    minAmount: 500,
    maxAmount: 10000,
    color: '#667eea',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '5',
    name: 'Pro',
    duration: 60,
    durationLabel: '60 Days',
    apy: 20,
    minAmount: 1000,
    maxAmount: 50000,
    color: '#f5576c',
    gradient: ['#f5576c', '#f44336'],
  },
  {
    id: '6',
    name: 'Ultimate',
    duration: 90,
    durationLabel: '90 Days',
    apy: 22,
    minAmount: 5000,
    maxAmount: 100000,
    color: '#ffd700',
    gradient: ['#ffd700', '#ffed4a'],
  },
];

interface ActiveStake {
  id: string;
  packageName: string;
  amount: string;
  apy: number;
  daysLeft: number;
  earned: string;
  color: string;
}

export default function StakingScreen() {
  const [selectedPackage, setSelectedPackage] = useState<StakingPackage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [activeStakes] = useState<ActiveStake[]>([
    { id: '1', packageName: 'Standard', amount: '100.00', apy: 15, daysLeft: 18, earned: '7.50', color: '#f093fb' },
    { id: '2', packageName: 'Basic', amount: '50.00', apy: 14, daysLeft: 5, earned: '2.80', color: '#43e97b' },
  ]);

  const availableBalance = '984.56';

  const handleSelectPackage = (pkg: StakingPackage) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const calculateReward = () => {
    if (!selectedPackage || !stakeAmount) return '0.00';
    const amount = parseFloat(stakeAmount) || 0;
    const reward = (amount * selectedPackage.apy / 100) * (selectedPackage.duration / 365);
    return reward.toFixed(2);
  };

  const handleStake = async () => {
    if (!selectedPackage || !stakeAmount) {
      Alert.alert('Error', 'Please enter an amount to stake.');
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount < selectedPackage.minAmount) {
      Alert.alert('Error', `Minimum stake amount is ${selectedPackage.minAmount} ASH.`);
      return;
    }

    if (amount > parseFloat(availableBalance)) {
      Alert.alert('Error', 'Insufficient balance.');
      return;
    }

    const reward = (amount * selectedPackage.apy / 100) * (selectedPackage.duration / 365);

    Alert.alert(
      'Confirm Stake',
      `Stake ${stakeAmount} ASH for ${selectedPackage.durationLabel} at ${selectedPackage.apy}% APY?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setShowModal(false);
            setStakeAmount('');
            
            // Schedule notification for staking maturity
            const durationMs = selectedPackage.duration * 24 * 60 * 60 * 1000;
            await scheduleStakingReminder(
              `stake_${Date.now()}`,
              selectedPackage.name,
              durationMs / 1000
            );
            
            // Also notify immediately that stake was created
            await notifyStakingComplete(
              selectedPackage.name,
              stakeAmount,
              reward.toFixed(2)
            );
            
            Alert.alert('Success', 'Your stake has been created successfully!');
          },
        },
      ]
    );
  };

  const renderPackage = (pkg: StakingPackage) => (
    <TouchableOpacity
      key={pkg.id}
      style={styles.packageCard}
      onPress={() => handleSelectPackage(pkg)}
      activeOpacity={0.8}
    >
      {pkg.popular && (
        <View style={styles.popularBadge}>
          <Gift size={12} color="#ffffff" />
          <Text style={styles.popularText}>Popular</Text>
        </View>
      )}
      
      <LinearGradient
        colors={pkg.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.packageHeader}
      >
        <View style={styles.packageTop}>
          <Text style={styles.packageName}>{pkg.name}</Text>
          <View style={styles.apyBadge}>
            <TrendingUp size={14} color="#ffffff" />
            <Text style={styles.apyText}>{pkg.apy}%</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.packageDetails}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#8e8e93" />
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{pkg.durationLabel}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Lock size={16} color="#8e8e93" />
          <Text style={styles.detailLabel}>Min - Max</Text>
          <Text style={styles.detailValue}>{pkg.minAmount} - {pkg.maxAmount} ASH</Text>
        </View>

        <View style={styles.rewardPreview}>
          <Text style={styles.rewardLabel}>Estimated Reward</Text>
          <Text style={styles.rewardValue}>
            +{(100 * pkg.apy / 100 * (pkg.duration / 365)).toFixed(2)} ASH
          </Text>
        </View>
      </View>

      <View style={styles.packageFooter}>
        <Text style={styles.stakeButton}>Stake Now</Text>
        <ChevronRight size={18} color={pkg.color} />
      </View>
    </TouchableOpacity>
  );

  const renderActiveStake = (stake: ActiveStake) => (
    <View key={stake.id} style={styles.activeStakeCard}>
      <View style={[styles.stakeColorBar, { backgroundColor: stake.color }]} />
      <View style={styles.stakeContent}>
        <View style={styles.stakeHeader}>
          <Text style={styles.stakeName}>{stake.packageName}</Text>
          <Text style={[styles.stakeStatus, { color: stake.color }]}>
            {stake.daysLeft} days left
          </Text>
        </View>
        <Text style={styles.stakeAmount}>{stake.amount} ASH @ {stake.apy}% APY</Text>
        <View style={styles.stakeProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${100 - (stake.daysLeft / 30) * 100}%`,
                  backgroundColor: stake.color 
                }
              ]} 
            />
          </View>
          <Text style={styles.earnedText}>Earned: {stake.earned} ASH</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Staking</Text>
          <View style={styles.balancePill}>
            <Text style={styles.balanceLabel}>Available</Text>
            <Text style={styles.balanceValue}>{availableBalance} ASH</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Info size={18} color="#667eea" />
          <Text style={styles.infoText}>
            Stake ASH tokens and earn up to 22% APY. Rewards are calculated daily and distributed automatically.
          </Text>
        </View>

        {/* Active Stakes */}
        {activeStakes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Stakes</Text>
            {activeStakes.map(renderActiveStake)}
          </View>
        )}

        {/* Available Packages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Packages</Text>
          {STAKING_PACKAGES.map(renderPackage)}
        </View>

        {/* APY Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>APY Tiers</Text>
          <View style={styles.legendGrid}>
            {STAKING_PACKAGES.map((pkg) => (
              <View key={pkg.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: pkg.color }]} />
                <Text style={styles.legendText}>{pkg.durationLabel} = {pkg.apy}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Stake Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPackage && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Stake {selectedPackage.name}</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Text style={styles.modalClose}>Close</Text>
                  </TouchableOpacity>
                </View>

                <LinearGradient
                  colors={selectedPackage.gradient}
                  style={styles.modalPackageCard}
                >
                  <Text style={styles.modalApy}>{selectedPackage.apy}% APY</Text>
                  <Text style={styles.modalDuration}>{selectedPackage.durationLabel}</Text>
                </LinearGradient>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Amount (ASH)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      placeholderTextColor="#8e8e93"
                      value={stakeAmount}
                      onChangeText={setStakeAmount}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity 
                      style={styles.maxButton}
                      onPress={() => setStakeAmount(availableBalance)}
                    >
                      <Text style={styles.maxText}>MAX</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.inputHint}>
                    Min: {selectedPackage.minAmount} - Max: {selectedPackage.maxAmount} ASH
                  </Text>
                </View>

                <View style={styles.rewardSection}>
                  <Text style={styles.rewardSectionLabel}>Estimated Reward</Text>
                  <Text style={styles.rewardSectionValue}>+{calculateReward()} ASH</Text>
                </View>

                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total at Maturity</Text>
                  <Text style={styles.totalValue}>
                    +{((parseFloat(stakeAmount) || 0) + parseFloat(calculateReward())).toFixed(2)} ASH
                  </Text>
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={handleStake}>
                  <LinearGradient
                    colors={selectedPackage.gradient}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>Confirm Stake</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
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
  balancePill: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  balanceLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#f0f0ff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#667eea',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  activeStakeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  stakeColorBar: {
    width: 4,
  },
  stakeContent: {
    flex: 1,
    padding: 16,
  },
  stakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stakeName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  stakeStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  stakeAmount: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  stakeProgress: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  earnedText: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 6,
  },
  packageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  packageHeader: {
    padding: 20,
  },
  packageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  apyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  apyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  packageDetails: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8e8e93',
    marginLeft: 10,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  rewardPreview: {
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardLabel: {
    fontSize: 13,
    color: '#8e8e93',
  },
  rewardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4caf50',
  },
  packageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  stakeButton: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667eea',
  },
  legend: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  legendTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#8e8e93',
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
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  modalClose: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  modalPackageCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  modalApy: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalDuration: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  inputSection: {
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
  rewardSection: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardSectionLabel: {
    fontSize: 15,
    color: '#4caf50',
  },
  rewardSectionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4caf50',
  },
  totalSection: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 15,
    color: '#8e8e93',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  confirmButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});
