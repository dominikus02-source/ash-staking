// app/kyc.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Camera, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useSettingsStore, themes } from '../src/stores/useSettingsStore';
import { useAuthStore } from '../src/stores/useAuthStore';
import { db, storage } from '../src/lib/firebase';

export default function KYCScreen() {
  const router = useRouter();
  const { theme } = useSettingsStore();
  const { uid } = useAuthStore();
  const colors = themes[theme];

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    // Tampilkan pilihan: Kamera atau Galeri
    Alert.alert(
      "Upload ID Photo",
      "Choose source:",
      [
        { text: "Take Photo", onPress: () => launchCamera() },
        { text: "Choose from Gallery", onPress: () => launchGallery() },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const launchCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setIdImage(result.assets[0].uri);
  };

  const launchGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setIdImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!fullName || !address || !idNumber || !idImage) {
      Alert.alert('Incomplete', 'Please fill all fields and upload ID photo.');
      return;
    }
    if (!uid) return;
    setSubmitting(true);
    try {
      let photoURL = '';
      if (idImage) {
        const response = await fetch(idImage);
        const blob = await response.blob();
        const fileRef = ref(storage, `kyc/${uid}/id_photo`);
        await uploadBytes(fileRef, blob);
        photoURL = `kyc/${uid}/id_photo`;
      }
      await updateDoc(doc(db, 'users', uid), {
        kycStatus: 'pending',
        kycData: {
          fullName,
          address,
          idNumber,
          photoURL,
          submittedAt: Date.now(),
        },
      });
      Alert.alert('Success', 'KYC submitted for review. You will be notified once approved.', [{
        text: 'OK', onPress: () => router.back(),
      }]);
    } catch (err) {
      console.error('[KYC] Submit failed:', err);
      Alert.alert('Error', 'Failed to submit KYC. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>KYC Verification</Text>
          <View style={{width: 24}} />
        </View>

        {/* FORM INPUTS */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Jl. Sudirman No. 1..."
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>ID Number (KTP/Passport)</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="1234567890"
            value={idNumber}
            onChangeText={setIdNumber}
            keyboardType="numeric"
          />
        </View>

        {/* UPLOAD ID PHOTO */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Upload ID Photo</Text>
          <TouchableOpacity style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={pickImage}>
            {idImage ? (
              <Image source={{ uri: idImage }} style={styles.previewImage} />
            ) : (
              <>
                <Camera size={32} color={colors.textSecondary} />
                <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Tap to Upload</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: submitting ? colors.border : colors.primary }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <>
              <ShieldCheck size={20} color="#fff" />
              <Text style={styles.submitText}>SUBMIT FOR REVIEW</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  uploadBox: { height: 150, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderRadius: 12 },
  uploadText: { marginTop: 8, fontSize: 14 },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  submitBtn: { flexDirection: 'row', paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});