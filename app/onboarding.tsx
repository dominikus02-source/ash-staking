import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, TrendingUp, Shield, Wallet, Gift, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Welcome to ASH STAKING',
    subtitle: 'Your gateway to smart cryptocurrency staking with guaranteed returns.',
    icon: (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconGradient}
      >
        <TrendingUp size={40} color="#ffffff" />
      </LinearGradient>
    ),
    background: '#f8f9ff',
  },
  {
    id: '2',
    title: 'Earn Up to 22% APY',
    subtitle: 'Stake your ASH tokens and watch your rewards grow daily with our flexible plans.',
    icon: (
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconGradient}
      >
        <Zap size={40} color="#ffffff" />
      </LinearGradient>
    ),
    background: '#fff5f8',
  },
  {
    id: '3',
    title: 'Secure & Transparent',
    subtitle: 'Your funds are protected with enterprise-grade security and audited smart contracts.',
    icon: (
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconGradient}
      >
        <Shield size={40} color="#ffffff" />
      </LinearGradient>
    ),
    background: '#f0f9ff',
  },
  {
    id: '4',
    title: 'Grow Your Network',
    subtitle: 'Invite friends and earn 5% commission on their staking rewards. Share success together!',
    icon: (
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconGradient}
      >
        <Gift size={40} color="#ffffff" />
      </LinearGradient>
    ),
    background: '#f0fdf4',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(main)/home');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      router.replace('/(main)/home');
    }
  };

  const skipOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(main)/home');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      router.replace('/(main)/home');
    }
  };

  const renderItem = ({ item }: { item: typeof ONBOARDING_DATA[0] }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.background }]}>
        <View style={styles.iconContainer}>
          {item.icon}
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {ONBOARDING_DATA.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 20, 10],
            extrapolate: 'clamp',
          });

          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#e5e5ea', '#667eea', '#e5e5ea'],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { width: dotWidth, backgroundColor },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Dots */}
        {renderDots()}

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={scrollTo}>
          <Text style={styles.buttonText}>
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 17,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
