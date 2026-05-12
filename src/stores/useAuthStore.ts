// src/stores/useAuthStore.ts
// FIX: Jangan persist Firebase User object langsung — tidak bisa di-serialize.
// Cukup simpan uid + meta. Firebase auth handle session-nya sendiri via AsyncStorage persistence.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserMeta {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  uid?: string;
  username?: string;
}

interface AuthState {
  uid: string | null;
  userMeta: UserMeta | null;
  isLoading: boolean;
  setUser: (uid: string | null, meta?: Partial<UserMeta>) => void;
  setMeta: (meta: Partial<UserMeta>) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
  initAuthListener: () => () => void;
}

interface AuthState {
  // Simpan uid saja, bukan full Firebase User object
  uid: string | null;
  userMeta: UserMeta | null;
  isLoading: boolean;
  setUser: (uid: string | null, meta?: Partial<UserMeta>) => void;
  setMeta: (meta: Partial<UserMeta>) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      uid: null,
      userMeta: null,
      isLoading: true,
      setUser: (uid, meta) => set({
        uid,
        userMeta: meta ? { ...meta, uid: uid ?? undefined } : null,
        isLoading: false,
      }),
      setMeta: (meta) => set((state) => ({
        userMeta: { ...state.userMeta, ...meta }
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      clearUser: () => set({ uid: null, userMeta: null, isLoading: false }),
      initAuthListener: () => {
        const unsub = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const snap = await getDoc(doc(db, 'users', user.uid));
              const firestoreData = snap.exists() ? snap.data() : null;
              set({
                uid: user.uid,
                userMeta: {
                  uid: user.uid,
                  email: user.email || firestoreData?.email || null,
                  displayName: firestoreData?.displayName || user.displayName || null,
                  photoURL: firestoreData?.photoURL || user.photoURL || null,
                  username: firestoreData?.username || user.email?.split('@')[0] || null,
                },
                isLoading: false,
              });
            } catch {
              set({
                uid: user.uid,
                userMeta: {
                  uid: user.uid,
                  email: user.email || null,
                  displayName: user.displayName || null,
                  photoURL: user.photoURL || null,
                },
                isLoading: false,
              });
            }
          } else {
            set({ uid: null, userMeta: null, isLoading: false });
          }
        });
        return unsub;
      },
    }),
    {
      name: 'ash-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ uid: state.uid, userMeta: state.userMeta }),
    }
  )
);