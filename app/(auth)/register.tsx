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
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, User, Gift } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;
    
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter your password.');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service and Privacy Policy.');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simulate registration - Replace with actual Firebase/Auth logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if there's a referral code and give bonus
      if (formData.referralCode.trim()) {
        Alert.alert(
          'Welcome Bonus!',
          'You received a bonus for using a referral code!',
          [{ text: 'Continue', onPress: () => router.replace('/onboarding') }]
        );
      } else {
        router.replace('/onboarding');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (password.length === 0) return { level: 0, text: '', color: '#e5e5ea' };
    if (password.length < 6) return { level: 1, text: 'Weak', color: '#ff3b30' };
    if (password.length < 10) return { level: 2, text: 'Medium', color: '#ff9500' };
    return { level: 3, text: 'Strong', color: '#34c759' };
  };

  const strength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>AS</Text>
              </LinearGradient>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join ASH STAKING and start earning</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#8e8e93"
                    value={formData.fullName}
                    onChangeText={(v) => updateField('fullName', v)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#8e8e93"
                    value={formData.email}
                    onChangeText={(v) => updateField('email', v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="#8e8e93"
                    value={formData.password}
                    onChangeText={(v) => updateField('password', v)}
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
                
                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3].map((level) => (
                        <View
                          key={level}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor: level <= strength.level 
                                ? strength.color 
                                : '#e5e5ea'
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthText, { color: strength.color }]}>
                      {strength.text}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#8e8e93"
                    value={formData.confirmPassword}
                    onChangeText={(v) => updateField('confirmPassword', v)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#8e8e93" />
                    ) : (
                      <Eye size={20} color="#8e8e93" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Referral Code */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Referral Code (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Gift size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter referral code"
                    placeholderTextColor="#8e8e93"
                    value={formData.referralCode}
                    onChangeText={(v) => updateField('referralCode', v.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={6}
                  />
                </View>
              </View>

              {/* Terms Agreement */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View style={[
                  styles.checkbox,
                  agreedToTerms && styles.checkboxActive
                ]}>
                  {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity 
                style={[
                  styles.registerButton,
                  (!agreedToTerms || loading) && styles.registerButtonDisabled
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e93',
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 8,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8e8e93',
    marginRight: 10,
    marginTop: 2,
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
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
  },
  termsLink: {
    color: '#667eea',
    fontWeight: '500',
  },
  registerButton: {
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
  registerButtonDisabled: {
    backgroundColor: '#c7c7cc',
    shadowOpacity: 0,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 15,
    color: '#8e8e93',
  },
  loginText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600',
  },
});
