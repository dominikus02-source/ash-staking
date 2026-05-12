// src/hooks/useMiningSync.ts
// FIX: Tunggu Firebase Auth ready sebelum query Firestore
// Mencegah permission-denied karena request.auth null

import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
  cancelMiningDoneNotification,
  scheduleDailyMiningReminder, scheduleMiningDoneNotification,
  scheduleNormalBoostDoneNotification, schedulePremiumBoostDoneNotification,
  setupNotifications,
} from '../lib/notifications';
import { useAuthStore } from '../stores/useAuthStore';

const BASIC_HASHRATE = 0.048;
const BOOST_MULTIPLIER = 0.5;
const NORMAL_BOOST_DURATION_MS = 30 * 60 * 1000;
const PREMIUM_BOOST_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const PREMIUM_COST = 14;
const MINING_DURATION_SEC = 21600;
const TRANSFER_GAS_FEE = 0.001;

const BALANCE_CACHE_KEY = (uid: string) => `ash_balance_cache_${uid}`;
const MINING_CACHE_KEY = (uid: string) => `ash_mining_cache_${uid}`;

export function useMiningSync() {
  const { uid } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [miningData, setMiningData] = useState<any>(null);
  const [docReady, setDocReady] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [firebaseAuthReady, setFirebaseAuthReady] = useState(false);

  const tickerRef = useRef<any>(null);
  const notifSetupDone = useRef(false);
  const unsubscribeFirestoreRef = useRef<(() => void) | null>(null);
  const isAutoClosingRef = useRef(false);

  // Step 1: Tunggu Firebase Auth state ready
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('[MINING_SYNC] Firebase Auth ready:', firebaseUser.uid);
        setFirebaseAuthReady(true);
      } else {
        console.warn('[MINING_SYNC] Firebase Auth not ready yet');
        setFirebaseAuthReady(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // Step 2: Setup notifikasi
  useEffect(() => {
    if (!uid || notifSetupDone.current) return;
    setupNotifications().then((granted) => {
      if (granted) {
        notifSetupDone.current = true;
        scheduleDailyMiningReminder();
      }
    });
  }, [uid]);

  // Step 3: Load balance cache
  useEffect(() => {
    if (!uid) return;
    AsyncStorage.getItem(BALANCE_CACHE_KEY(uid)).then((cached) => {
      if (cached) {
        const parsed = parseFloat(cached);
        if (!isNaN(parsed)) setDisplayBalance(parsed);
      }
    });
  }, [uid]);

  // Step 4: Init Firestore — HANYA setelah Firebase Auth ready
  useEffect(() => {
    if (!uid || !firebaseAuthReady) {
      if (uid && !firebaseAuthReady) {
        console.log('[MINING_SYNC] Waiting for Firebase Auth...');
      }
      return;
    }

    console.log('[MINING_SYNC] Initializing Firestore for:', uid);
    const userRef = doc(db, 'users', uid);
    setLoading(true);

    const initUser = async () => {
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            balance: 2.0,
            mining: { isActive: false, startTime: null, lastSync: Date.now() },
            boosts: { normalEndTime: 0, premiumEndTime: 0 },
            createdAt: Date.now(),
            lastDailyClaim: 0,
          });
        } else {
          const data = snap.data();
          if (!data.balance && data.ashBalance) {
            await updateDoc(userRef, { balance: data.ashBalance });
          }
        }
        setDocReady(true);
        setLoading(false);
      } catch (e) {
        console.error('[MINING_SYNC] Init failed:', e);
        setLoading(false);
      }
    };

    initUser();

    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data()!;
      const now = Date.now();

      let currentHashrate = BASIC_HASHRATE;
      if ((data.boosts?.normalEndTime || 0) > now || (data.boosts?.premiumEndTime || 0) > now) {
        currentHashrate += BASIC_HASHRATE * BOOST_MULTIPLIER;
      }

      let calculatedBalance = data.balance || 0;
      if (data.mining?.isActive && data.mining?.startTime) {
        const elapsedSec = Math.min((now - data.mining.startTime) / 1000, MINING_DURATION_SEC);
        calculatedBalance += elapsedSec * (currentHashrate / 3600);
      }

      const isActive = !!data.mining?.isActive;
      const startTime = data.mining?.startTime;
      const elapsedSec = isActive && startTime ? (now - startTime) / 1000 : 0;
      const isComplete = isActive && startTime && elapsedSec >= MINING_DURATION_SEC;

      if (isComplete && !isAutoClosingRef.current) {
        isAutoClosingRef.current = true;
        try {
          await updateDoc(userRef, {
            balance: calculatedBalance,
            'mining.isActive': false,
            'mining.startTime': null,
            'mining.lastSync': now,
          });
          const earned = Math.max(0, calculatedBalance - (data.balance || 0));
          try {
            await addDoc(collection(db, 'users', uid!, 'transactions'), {
              type: 'mining_reward',
              amount: earned,
              description: `Mining Reward - Auto-complete - ${earned.toFixed(6)} ASH earned`,
              balanceAfter: calculatedBalance,
              createdAt: now,
            });
          } catch (_) {}
          await cancelMiningDoneNotification();
          await AsyncStorage.setItem(BALANCE_CACHE_KEY(uid!), calculatedBalance.toString());
          await AsyncStorage.removeItem(MINING_CACHE_KEY(uid!));
        } catch (err) {
          console.error('[MINING_SYNC] Auto-close failed:', err);
          isAutoClosingRef.current = false;
        }
        return;
      }
      isAutoClosingRef.current = false;

      setMiningData({
        ...data,
        calculatedBalance,
        currentHashrate,
        isNormalBoostActive: (data.boosts?.normalEndTime || 0) > now,
        isPremiumBoostActive: (data.boosts?.premiumEndTime || 0) > now,
        normalBoostTimeLeft: Math.max(0, (data.boosts?.normalEndTime || 0) - now),
        premiumBoostTimeLeft: Math.max(0, (data.boosts?.premiumEndTime || 0) - now),
      });

      AsyncStorage.setItem(BALANCE_CACHE_KEY(uid), calculatedBalance.toString());
      if (!data.mining?.isActive) setDisplayBalance(data.balance || 0);
    }, (error) => {
      console.error('[MINING_SYNC] Snapshot error:', error.code);
    });

    unsubscribeFirestoreRef.current = unsubscribe;

    return () => {
      unsubscribe();
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [uid, firebaseAuthReady]); // Re-run saat Firebase Auth ready

  // Ticker balance
  useEffect(() => {
    if (tickerRef.current) clearInterval(tickerRef.current);

    const isActive = miningData?.mining?.isActive;
    const startTime = miningData?.mining?.startTime;
    const baseBalance = miningData?.balance || 0;
    const hashrate = miningData?.currentHashrate || BASIC_HASHRATE;

    if (isActive && startTime) {
      tickerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSec = Math.min((now - startTime) / 1000, MINING_DURATION_SEC);
        const newBalance = baseBalance + (elapsedSec * (hashrate / 3600));
        setDisplayBalance(newBalance);
        if (Math.floor(elapsedSec) % 5 === 0 && uid) {
          AsyncStorage.setItem(BALANCE_CACHE_KEY(uid), newBalance.toString());
        }
      }, 100);
    }

    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [miningData?.mining?.isActive, miningData?.mining?.startTime, miningData?.balance, miningData?.currentHashrate, uid]);

// ACTIONS
  const startMining = useCallback(async () => {
    if (!uid || !docReady || miningData?.mining?.isActive) return;
    try {
      const startTime = Date.now();
      const localMiningState = {
        startTime,
        expectedEnd: startTime + MINING_DURATION_SEC * 1000,
        baseBalance: miningData?.calculatedBalance || miningData?.balance || 0,
        hashRate: miningData?.currentHashrate || BASIC_HASHRATE,
        savedAt: Date.now(),
      };
      await AsyncStorage.setItem(MINING_CACHE_KEY(uid), JSON.stringify(localMiningState));
      await updateDoc(doc(db, 'users', uid), {
        'mining.isActive': true,
        'mining.startTime': startTime,
        'mining.lastSync': startTime,
      });
      await scheduleMiningDoneNotification(startTime);
    } catch (error) {
      console.error('[MINING_SYNC] Start failed:', error);
    }
  }, [uid, docReady, miningData]);

  const addTransaction = useCallback(async (type: string, amount: number, description: string) => {
    if (!uid) return;
    try {
      await addDoc(collection(db, 'users', uid, 'transactions'), {
        type,
        amount,
        description,
        balanceAfter: miningData?.calculatedBalance || miningData?.balance || 0,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error('[MINING_SYNC] addTransaction failed:', err);
    }
  }, [uid, miningData]);

  const claimMining = useCallback(async () => {
    if (!uid || !docReady || !miningData?.mining?.isActive) return;
    try {
      const finalBalance = miningData.calculatedBalance;
      const earned = Math.max(0, finalBalance - (miningData.balance || 0));
      await updateDoc(doc(db, 'users', uid), {
        balance: finalBalance,
        'mining.isActive': false,
        'mining.startTime': null,
        'mining.lastSync': Date.now(),
      });
      await addTransaction('mining_reward', earned, `Mining Reward - ${earned.toFixed(6)} ASH earned`);
      await AsyncStorage.setItem(BALANCE_CACHE_KEY(uid), finalBalance.toString());
      await AsyncStorage.removeItem(MINING_CACHE_KEY(uid));
      await cancelMiningDoneNotification();
    } catch (error) {
      console.error('[MINING_SYNC] Claim failed:', error);
    }
  }, [uid, docReady, miningData, addTransaction]);

  const claimDailyBonus = useCallback(async () => {
    if (!uid || !docReady) return;
    const today = new Date().toDateString();
    if (new Date(miningData?.lastDailyClaim || 0).toDateString() === today) {
      alert('Already claimed today!');
      return;
    }
    try {
      const bonusAmount = 0.005;
      const newBalance = (miningData?.calculatedBalance || 0) + bonusAmount;
      await updateDoc(doc(db, 'users', uid), {
        balance: newBalance,
        lastDailyClaim: Date.now(),
      });
      await addTransaction('daily_bonus', bonusAmount, 'Daily Bonus');
    } catch (error) {
      alert('Gagal klaim bonus harian.');
    }
  }, [uid, docReady, miningData, addTransaction]);

  const activateNormalBoost = useCallback(async () => {
    if (!uid || !docReady) return;
    try {
      const boostEndTime = Date.now() + NORMAL_BOOST_DURATION_MS;
      await updateDoc(doc(db, 'users', uid), { 'boosts.normalEndTime': boostEndTime });
      await scheduleNormalBoostDoneNotification(boostEndTime);
    } catch (error) {
      console.error('Boost failed:', error);
    }
  }, [uid, docReady]);

  const activatePremiumBoost = useCallback(async () => {
    if (!uid || !docReady) return;
    if ((miningData?.calculatedBalance || 0) < PREMIUM_COST) {
      alert('Saldo tidak cukup!');
      return;
    }
    try {
      const boostEndTime = Date.now() + PREMIUM_BOOST_DURATION_MS;
      await updateDoc(doc(db, 'users', uid), {
        balance: miningData.calculatedBalance - PREMIUM_COST,
        'boosts.premiumEndTime': boostEndTime,
      });
      await schedulePremiumBoostDoneNotification(boostEndTime);
    } catch (error) {
      console.error('Premium Boost failed:', error);
    }
  }, [uid, docReady, miningData]);

  const transferAsh = useCallback(async (recipientUid: string, amount: number) => {
    if (!uid || !docReady) return 'NOT_READY';
    if (uid === recipientUid) return 'CANNOT_SELF';
    if (amount <= 0) return 'INVALID_AMOUNT';
    const totalCost = amount + TRANSFER_GAS_FEE;
    if ((miningData?.calculatedBalance || 0) < totalCost) return 'INSUFFICIENT_BALANCE';
    try {
      const recipientSnap = await getDoc(doc(db, 'users', recipientUid));
      if (!recipientSnap.exists()) return 'RECIPIENT_NOT_FOUND';
      const senderBalance = miningData.calculatedBalance;
      const recipientData = recipientSnap.data();
      const recipientNewBalance = (recipientData.balance || 0) + amount;
      const batch = async () => {
        await updateDoc(doc(db, 'users', uid), { balance: senderBalance - totalCost });
        await addDoc(collection(db, 'users', uid, 'transactions'), {
          type: 'transfer_sent',
          amount: -amount,
          fee: TRANSFER_GAS_FEE,
          description: `Sent ${amount.toFixed(6)} ASH`,
          balanceAfter: senderBalance - totalCost,
          recipientUid,
          createdAt: Date.now(),
        });
        await addDoc(collection(db, 'users', recipientUid, 'transactions'), {
          type: 'transfer_received',
          amount,
          fee: 0,
          description: `Received ${amount.toFixed(6)} ASH`,
          balanceAfter: recipientNewBalance,
          senderUid: uid,
          createdAt: Date.now(),
        });
      };
      await batch();
      return 'SUCCESS';
    } catch (err) {
      console.error('[MINING_SYNC] Transfer failed:', err);
      return 'ERROR';
    }
  }, [uid, docReady, miningData]);

  return {
    loading,
    miningData,
    displayBalance,
    startMining,
    claimMining,
    claimDailyBonus,
    activateNormalBoost,
    activatePremiumBoost,
    addTransaction,
    transferAsh,
    TRANSFER_GAS_FEE,
  };
}