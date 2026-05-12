import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
} from 'lucide-react-native';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  bankAccount: string;
  avatar: string | null;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+62 812 3456 7890',
    bankAccount: 'BCA **** 1234',
    avatar: null,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.fullName);

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
      setProfile({ ...profile, avatar: result.assets[0].uri });
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setProfile({ ...profile, fullName: editName.trim() });
    await AsyncStorage.setItem('userName', editName.trim());
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            // In a real app, you would redirect to login screen
            Alert.alert('Logged Out', 'You have been logged out.');
          },
        },
      ]
    );
  };

  const settings: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage push notifications',
      icon: <Bell size={22} color="#667eea" />,
      type: 'navigation',
    },
    {
      id: 'security',
      title: 'Security',
      subtitle: 'Biometrics, PIN, passwords',
      icon: <Shield size={22} color="#4facfe" />,
      type: 'navigation',
    },
    {
      id: 'language',
      title: 'Language',
      subtitle: 'English',
      icon: <Globe size={22} color="#43e97b" />,
      type: 'navigation',
    },
    {
      id: 'dark_mode',
      title: 'Dark Mode',
      icon: <Moon size={22} color="#f093fb" />,
      type: 'toggle',
      value: false,
    },
    {
      id: 'biometric',
      title: 'Biometric Login',
      icon: <Fingerprint size={22} color="#ffd700" />,
      type: 'toggle',
      value: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQs, contact us',
      icon: <HelpCircle size={22} color="#f5576c" />,
      type: 'navigation',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <Lock size={22} color="#8e8e93" />,
      type: 'navigation',
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={() => {
        if (item.type === 'navigation') {
          Alert.alert(item.title, `${item.title} settings coming soon.`);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: item.icon.props.color + '20' }]}>
        {item.icon}
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.type === 'navigation' && (
        <ChevronRight size={20} color="#c7c7cc" />
      )}
      {item.type === 'toggle' && (
        <View style={[styles.toggle, item.value && styles.toggleActive]}>
          <View style={[styles.toggleKnob, item.value && styles.toggleKnobActive]} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitial}>
                  {profile.fullName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                placeholder="Enter your name"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setEditName(profile.fullName);
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.userName}>{profile.fullName}</Text>
              <Text style={styles.editHint}>Tap to edit</Text>
            </TouchableOpacity>
          )}

          {/* Member Stats */}
          <View style={styles.memberStats}>
            <View style={styles.memberStat}>
              <Award size={18} color="#ffd700" />
              <Text style={styles.memberStatValue}>Bronze</Text>
            </View>
            <View style={styles.memberDivider} />
            <View style={styles.memberStat}>
              <Star size={18} color="#667eea" />
              <Text style={styles.memberStatValue}>125 Points</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Mail size={20} color="#667eea" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Phone size={20} color="#4facfe" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <CreditCard size={20} color="#43e97b" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Bank Account</Text>
                <Text style={styles.infoValue}>{profile.bankAccount}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {settings.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderSettingItem(item)}
                {index < settings.length - 1 && <View style={styles.settingDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>ASH STAKING</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ff3b30" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
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
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    textAlign: 'center',
  },
  editHint: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
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
  saveButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#8e8e93',
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
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#f5f5f7',
    marginLeft: 68,
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 16,
    backgroundColor: '#e5e5ea',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#34c759',
  },
  toggleKnob: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ff3b30',
  },
});
