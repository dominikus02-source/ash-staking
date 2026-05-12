import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Fingerprint, Mail, Lock } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Biometric Not Available', 'Please use email and password to login.');
        return;
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to ASH STAKING',
        fallbackLabel: 'Use Password',
      });
      
      if (result.success) {
        router.replace('/(main)/home');
      }
    } catch (error) {
      console.log('Biometric error:', error);
    }
  };

  const handleEmailLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate login - Replace with actual Firebase/Auth logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store auth state
      // await AsyncStorage.setItem('user', JSON.stringify({ email: cleanEmail }));
      
      router.replace('/(main)/home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Enter your email address and we will send you a password reset link.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            if (email) {
              Alert.alert('Success', 'Password reset link sent to your email.');
            } else {
              Alert.alert('Error', 'Please enter your email first.');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo & Branding */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>AS</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>ASH STAKING</Text>
            <Text style={styles.subtitle}>Stake & Earn Rewards</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#8e8e93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#8e8e93"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#8e8e93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#8e8e93"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#8e8e93" />
                  ) : (
                    <Eye size={20} color="#8e8e93" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember & Forgot */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxActive
                ]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Biometric Button */}
            <TouchableOpacity 
              style={styles.biometricButton}
              onPress={handleBiometric}
            >
              <Fingerprint size={24} color="#667eea" />
              <Text style={styles.biometricText}>Sign in with Face ID</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e93',
    marginTop: 4,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 17,
    color: '#1c1c1e',
  },
  eyeButton: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8e8e93',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 15,
    color: '#8e8e93',
  },
  forgotText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5ea',
  },
  dividerText: {
    color: '#8e8e93',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    height: 56,
    gap: 12,
  },
  biometricText: {
    fontSize: 17,
    color: '#667eea',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#8e8e93',
  },
  registerText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600',
  },
});
