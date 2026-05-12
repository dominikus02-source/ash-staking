import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CreditCard,
  Smartphone,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Info,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';

const { width } = Dimensions.get('window');

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: <CreditCard size={24} color="#ffffff" />,
    color: '#4facfe',
    description: 'Transfer via BCA, BNI, BRI, Mandiri',
  },
  {
    id: 'ewallet',
    name: 'E-Wallet',
    icon: <Smartphone size={24} color="#ffffff" />,
    color: '#43e97b',
    description: 'OVO, Dana, Gopay, ShopeePay',
  },
  {
    id: 'qris',
    name: 'QRIS',
    icon: <Wallet size={24} color="#ffffff" />,
    color: '#667eea',
    description: 'Scan any QR code to pay',
  },
];

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

interface MidtransConfig {
  clientKey: string;
  isProduction: boolean;
  baseUrl: string;
}

const MIDTRANS_CONFIG: MidtransConfig = {
  // Replace with your Midtrans Client Key
  clientKey: 'YOUR_MIDTRANS_CLIENT_KEY',
  isProduction: false,
  baseUrl: 'https://app.midtrans.com',
};

export default function BuyASHScreen() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [orderId] = useState(`ASH-${Date.now()}`);

  const ashPrice = 0.81; // USD per ASH
  const calculatedASH = amount ? (parseFloat(amount) / ashPrice).toFixed(2) : '0.00';

  const handleAmountSelect = (preset: number) => {
    setAmount(preset.toString());
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10) {
      Alert.alert('Error', 'Minimum purchase amount is $10.');
      return false;
    }
    if (numAmount > 10000) {
      Alert.alert('Error', 'Maximum purchase amount is $10,000.');
      return false;
    }
    return true;
  };

  const handlePurchase = async () => {
    if (!validateAmount()) return;

    setLoading(true);

    try {
      // Generate Midtrans Snap Token
      const token = await generateMidtransToken();
      
      // In a real implementation, you would:
      // 1. Open Midtrans Snap payment page
      // 2. Handle the payment result
      // 3. Credit the user's account upon success

      Alert.alert(
        'Payment Initiated',
        `Amount: $${amount}\nASH: ${calculatedASH}\n\nThis would open Midtrans Snap payment page.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Simulate Success',
            onPress: () => {
              Alert.alert('Success!', `You purchased ${calculatedASH} ASH!`);
              setAmount('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const generateMidtransToken = async (): Promise<string> => {
    // This is a mock function
    // In production, you would call your backend to generate a Snap token
    
    // Example backend call:
    // const response = await fetch('YOUR_BACKEND_API/create-transaction', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     order_id: orderId,
    //     amount: amount,
    //     ash_amount: calculatedASH,
    //   }),
    // });
    // const data = await response.json();
    // return data.token;

    return 'mock-snap-token-' + Date.now();
  };

  const openMidtransDocs = () => {
    Linking.openURL('https://docs.midtrans.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Buy ASH</Text>
          <View style={styles.priceTag}>
            <TrendingUp size={14} color="#4caf50" />
            <Text style={styles.priceText}>$0.81/ASH</Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Shield size={18} color="#667eea" />
          <Text style={styles.infoText}>
            Secure payment powered by Midtrans. Your ASH tokens will be credited instantly after payment confirmation.
          </Text>
        </View>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Enter Amount (USD)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#c7c7cc"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.ashEquivalent}>
            <Text style={styles.ashText}>≈ {calculatedASH} ASH</Text>
          </View>

          {/* Preset Amounts */}
          <View style={styles.presetContainer}>
            {PRESET_AMOUNTS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetButton,
                  amount === preset.toString() && styles.presetButtonActive
                ]}
                onPress={() => handleAmountSelect(preset)}
              >
                <Text style={[
                  styles.presetText,
                  amount === preset.toString() && styles.presetTextActive
                ]}>
                  ${preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive
              ]}
              onPress={() => setSelectedMethod(method.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[method.color, method.color + 'dd']}
                style={styles.methodIcon}
              >
                {method.icon}
              </LinearGradient>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <View style={[
                styles.radioCircle,
                selectedMethod === method.id && styles.radioCircleActive
              ]}>
                {selectedMethod === method.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        {amount && parseFloat(amount) >= 10 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount (USD)</Text>
              <Text style={styles.summaryValue}>${amount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ASH Amount</Text>
              <Text style={styles.summaryValueHighlight}>{calculatedASH} ASH</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Fee</Text>
              <Text style={styles.summaryValue}>$0.50</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${(parseFloat(amount) + 0.50).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresCard}>
          <View style={styles.featureItem}>
            <Clock size={20} color="#667eea" />
            <Text style={styles.featureText}>Instant Delivery</Text>
          </View>
          <View style={styles.featureItem}>
            <Shield size={20} color="#667eea" />
            <Text style={styles.featureText}>Secure Payment</Text>
          </View>
          <View style={styles.featureItem}>
            <CheckCircle2 size={20} color="#667eea" />
            <Text style={styles.featureText}>24/7 Support</Text>
          </View>
        </View>

        {/* Midtrans Info */}
        <TouchableOpacity style={styles.midtransInfo} onPress={openMidtransDocs}>
          <Text style={styles.midtransText}>Payment secured by</Text>
          <Text style={styles.midtransLogo}>Midtrans</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (!amount || parseFloat(amount) < 10 || loading) && styles.purchaseButtonDisabled
          ]}
          onPress={handlePurchase}
          disabled={!amount || parseFloat(amount) < 10 || loading}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.purchaseButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.purchaseButtonText}>Continue to Payment</Text>
                <ArrowRight size={20} color="#ffffff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollContent: {
    paddingBottom: 120,
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
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
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
  amountCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '600',
    color: '#1c1c1e',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1c1c1e',
    minWidth: 150,
    textAlign: 'center',
  },
  ashEquivalent: {
    alignItems: 'center',
    marginTop: 8,
  },
  ashText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#667eea',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  presetTextActive: {
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  methodCardActive: {
    borderColor: '#667eea',
  },
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  methodDescription: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#667eea',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#8e8e93',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  summaryValueHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: '#667eea',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667eea',
  },
  featuresCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 6,
  },
  midtransInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  midtransText: {
    fontSize: 13,
    color: '#8e8e93',
  },
  midtransLogo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#667eea',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  purchaseButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});
