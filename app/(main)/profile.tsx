import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db, storage, subscribeToUserData, signOut, UserData } from '../../src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Fingerprint,
  Moon,
  Globe,
  Lock,
  Award,
  Star,
  Edit2,
  Save,
  X,
  Building,
  Hash,
  UserCircle,
} from 'lucide-react-native';

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Bank Account State
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [editingBank, setEditingBank] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUserData(auth.currentUser?.uid || '', (data) => {
      setUserData(data);
      if (data) {
        setEditName(data.displayName || '');
        if (data as any?.bankAccount) {
          setBankAccount((data as any).bankAccount);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      await uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    if (!auth.currentUser) return;
    
    setUploadingPhoto(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `profile_photos/${auth.currentUser.uid}`);
      
      await uploadBytes(fileRef, blob);
      const photoURL = await getDownloadURL(fileRef);
      
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        photoURL,
      });
      
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveName = async () => {
    if (!auth.currentUser || !editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: editName.trim(),
      });
      await AsyncStorage.setItem('userName', editName.trim());
      setIsEditing(false);
      Alert.alert('Success', 'Name updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name.');
    }
  };

  const handleSaveBankAccount = async () => {
    if (!auth.currentUser) return;
    
    if (!bankAccount.bankName || !bankAccount.accountNumber || !bankAccount.accountHolder) {
      Alert.alert('Error', 'Please fill in all bank account fields.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        bankAccount: {
          bankName: bankAccount.bankName.trim(),
          accountNumber: bankAccount.accountNumber.trim(),
          accountHolder: bankAccount.accountHolder.trim(),
        },
      });
      setShowBankModal(false);
      setEditingBank(false);
      Alert.alert('Success', 'Bank account updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update bank account.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            await AsyncStorage.clear();
            // Navigation will handle redirect
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      </SafeAreaView>
    );
  }

  const memberTier = userData?.referralCount && userData.referralCount >= 50 ? 'Diamond' 
    : userData?.referralCount && userData.referralCount >= 30 ? 'Platinum'
    : userData?.referralCount && userData.referralCount >= 15 ? 'Gold'
    : userData?.referralCount && userData.referralCount >= 5 ? 'Silver' : 'Bronze';

  const tierColors: Record<string, string> = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#e5e4e2',
    Diamond: '#b9f2ff',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ff3b30" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={uploadingPhoto}>
            {userData?.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatarPlaceholder}
              >
                <User size={40} color="#ffffff" />
              </LinearGradient>
            )}
            <View style={styles.cameraButton}>
              {uploadingPhoto ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Camera size={16} color="#ffffff" />
              )}
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
                  <Save size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelEditButton} onPress={() => setIsEditing(false)}>
                  <X size={18} color="#8e8e93" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{userData?.displayName || 'User'}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Edit2 size={18} color="#667eea" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userEmail}>{userData?.email}</Text>
            </View>
          )}

          {/* Member Stats */}
          <View style={styles.memberStats}>
            <View style={styles.memberStat}>
              <Award size={18} color={tierColors[memberTier]} />
              <Text style={styles.memberStatValue}>{memberTier}</Text>
            </View>
            <View style={styles.memberDivider} />
            <View style={styles.memberStat}>
              <Star size={18} color="#667eea" />
              <Text style={styles.memberStatValue}>{userData?.totalTaskEarnings?.toFixed(1) || '0'} Points</Text>
            </View>
          </View>
        </View>

        {/* Bank Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Account</Text>
          <TouchableOpacity style={styles.bankCard} onPress={() => setShowBankModal(true)}>
            <View style={styles.bankIcon}>
              <Building size={24} color="#667eea" />
            </View>
            <View style={styles.bankInfo}>
              {bankAccount.bankName ? (
                <>
                  <Text style={styles.bankName}>{bankAccount.bankName}</Text>
                  <Text style={styles.bankNumber}>{bankAccount.accountNumber}</Text>
                  <Text style={styles.bankHolder}>{bankAccount.accountHolder}</Text>
                </>
              ) : (
                <Text style={styles.bankEmpty}>Add bank account for withdrawal</Text>
              )}
            </View>
            <ChevronRight size={20} color="#c7c7cc" />
          </TouchableOpacity>
          <Text style={styles.bankHint}>
            Required for withdrawing funds to your bank account
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Mail size={20} color="#667eea" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData?.email}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Phone size={20} color="#4facfe" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userData?.email?.split('@')[0] || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Code</Text>
          <View style={styles.referralCard}>
            <View style={styles.referralInfo}>
              <Text style={styles.referralLabel}>Your Code</Text>
              <Text style={styles.referralCode}>{userData?.referralCode}</Text>
            </View>
            <View style={styles.referralStats}>
              <Text style={styles.referralStatValue}>{userData?.referralCount || 0}</Text>
              <Text style={styles.referralStatLabel}>Referrals</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>ASH COIN STAKING</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Bank Account Modal */}
      <Modal
        visible={showBankModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank Account</Text>
              <TouchableOpacity onPress={() => setShowBankModal(false)}>
                <X size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <View style={styles.inputWrapper}>
                  <Building size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., BCA, Mandiri, BNI"
                    placeholderTextColor="#8e8e93"
                    value={bankAccount.bankName}
                    onChangeText={(v) => setBankAccount({ ...bankAccount, bankName: v })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <View style={styles.inputWrapper}>
                  <Hash size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter account number"
                    placeholderTextColor="#8e8e93"
                    value={bankAccount.accountNumber}
                    onChangeText={(v) => setBankAccount({ ...bankAccount, accountNumber: v })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Holder Name</Text>
                <View style={styles.inputWrapper}>
                  <UserCircle size={20} color="#8e8e93" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter holder name"
                    placeholderTextColor="#8e8e93"
                    value={bankAccount.accountHolder}
                    onChangeText={(v) => setBankAccount({ ...bankAccount, accountHolder: v })}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBankButton} onPress={handleSaveBankAccount}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.saveBankGradient}
                >
                  <Text style={styles.saveBankText}>Save Bank Account</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  nameContainer: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  editNameContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1c1c1e',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingVertical: 8,
    width: '80%',
  },
  editButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cancelEditButton: {
    padding: 8,
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  memberStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  memberDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e5ea',
    marginHorizontal: 20,
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
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bankIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  bankNumber: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  bankHolder: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  bankEmpty: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
  },
  bankHint: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoContent: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8e8e93',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
    marginTop: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f5f5f7',
    marginLeft: 50,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  referralInfo: {
    flex: 1,
  },
  referralLabel: {
    fontSize: 13,
    color: '#8e8e93',
  },
  referralCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#667eea',
    letterSpacing: 2,
    marginTop: 4,
  },
  referralStats: {
    alignItems: 'center',
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  referralStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  referralStatLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8e8e93',
    letterSpacing: 2,
  },
  appVersion: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
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
    maxHeight: '80%',
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
  inputGroup: {
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 17,
    color: '#1c1c1e',
  },
  saveBankButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
  },
  saveBankGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBankText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
