import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// ============= USER TYPES =============
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp | Date;
  
  // Wallet from Mining App (LOCKED)
  fundingBalance: number;
  
  // Wallet for Staking App (ACTIVE)
  tradingBalance: number;
  
  // Staking Data
  stakes: Stake[];
  totalStaked: number;
  totalEarned: number;
  
  // Referral
  referralCode: string;
  referredBy: string;
  referralCount: number;
  totalReferralEarnings: number;
  
  // Tasks
  completedTasks: string[];
  totalTaskEarnings: number;
  lastDailyCheckIn: Timestamp | null;
  
  // Metadata
  kycStatus: 'none' | 'pending' | 'verified';
  isPremium: boolean;
}

export interface Stake {
  id: string;
  packageId: string;
  packageName: string;
  amount: number;
  apy: number;
  duration: number;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  status: 'active' | 'completed' | 'cancelled';
  totalReward: number;
  claimedReward: number;
}

export interface Transaction {
  id: string;
  type: 'in' | 'out';
  category: 'staking' | 'task' | 'referral' | 'deposit' | 'withdraw' | 'transfer' | 'mining';
  title: string;
  amount: number;
  balanceAfter: number;
  createdAt: Timestamp | Date;
  status: 'completed' | 'pending' | 'failed';
}

// ============= AUTH FUNCTIONS =============
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  referredBy?: string
): Promise<UserData> {
  const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
  
  // Create auth user
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  
  // Update profile
  await updateProfile(user, { displayName });
  
  // Generate referral code (first 6 chars of UID)
  const referralCode = user.uid.substring(0, 6).toUpperCase();
  
  // Create user document
  const userData: UserData = {
    uid: user.uid,
    email: user.email,
    displayName,
    photoURL: null,
    createdAt: serverTimestamp(),
    
    // Funding wallet from mining (starts at 0 for new users)
    fundingBalance: 0,
    
    // Trading wallet for staking
    tradingBalance: 0,
    
    // Staking
    stakes: [],
    totalStaked: 0,
    totalEarned: 0,
    
    // Referral
    referralCode,
    referredBy: referredBy || '',
    referralCount: 0,
    totalReferralEarnings: 0,
    
    // Tasks
    completedTasks: [],
    totalTaskEarnings: 0,
    lastDailyCheckIn: null,
    
    // Metadata
    kycStatus: 'none',
    isPremium: false,
  };
  
  await setDoc(doc(db, 'users', user.uid), userData);
  
  // Process referral bonus if provided
  if (referredBy) {
    await processReferralBonus(referredBy, user.uid);
  }
  
  return userData;
}

export async function loginUser(email: string, password: string): Promise<UserData> {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const userData = await getUserData(credential.user.uid);
  
  return userData;
}

export async function signOut(): Promise<void> {
  const { signOut: firebaseSignOut } = await import('firebase/auth');
  await firebaseSignOut(auth);
}

// ============= USER DATA FUNCTIONS =============
export async function getUserData(uid: string): Promise<UserData | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  
  if (userDoc.exists()) {
    return userDoc.data() as UserData;
  }
  
  return null;
}

export function subscribeToUserData(
  uid: string,
  callback: (userData: UserData | null) => void
): () => void {
  const unsub = onSnapshot(doc(db, 'users', uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserData);
    } else {
      callback(null);
    }
  });
  
  return unsub;
}

// ============= WALLET FUNCTIONS =============
export async function updateTradingBalance(uid: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userData = await getUserData(uid);
  
  if (!userData) throw new Error('User not found');
  
  const newBalance = operation === 'add' 
    ? userData.tradingBalance + amount 
    : userData.tradingBalance - amount;
  
  if (newBalance < 0) throw new Error('Insufficient balance');
  
  await updateDoc(userRef, { tradingBalance: newBalance });
}

export async function addTransaction(
  uid: string,
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<void> {
  const txRef = doc(collection(db, 'users', uid, 'transactions'));
  await setDoc(txRef, {
    ...transaction,
    id: txRef.id,
    createdAt: serverTimestamp(),
  });
}

// ============= STAKING FUNCTIONS =============
export async function createStake(
  uid: string,
  stakeData: Omit<Stake, 'id' | 'startDate' | 'endDate' | 'totalReward' | 'claimedReward' | 'status'>
): Promise<Stake> {
  const userRef = doc(db, 'users', uid);
  const userData = await getUserData(uid);
  
  if (!userData) throw new Error('User not found');
  
  if (userData.tradingBalance < stakeData.amount) {
    throw new Error('Insufficient trading balance');
  }
  
  // Deduct from trading balance
  await updateDoc(userRef, {
    tradingBalance: userData.tradingBalance - stakeData.amount,
    totalStaked: userData.totalStaked + stakeData.amount,
  });
  
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + stakeData.duration * 24 * 60 * 60 * 1000);
  const totalReward = stakeData.amount * (stakeData.apy / 100) * (stakeData.duration / 365);
  
  const newStake: Stake = {
    ...stakeData,
    id: `stake_${Date.now()}`,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    status: 'active',
    totalReward,
    claimedReward: 0,
  };
  
  await updateDoc(userRef, {
    stakes: [...userData.stakes, newStake],
  });
  
  // Add transaction
  await addTransaction(uid, {
    type: 'out',
    category: 'staking',
    title: `Stake Deposit - ${stakeData.packageName}`,
    amount: stakeData.amount,
    balanceAfter: userData.tradingBalance - stakeData.amount,
    status: 'completed',
  });
  
  return newStake;
}

export async function claimStakeReward(uid: string, stakeId: string): Promise<number> {
  const userRef = doc(db, 'users', uid);
  const userData = await getUserData(uid);
  
  if (!userData) throw new Error('User not found');
  
  const stakeIndex = userData.stakes.findIndex(s => s.id === stakeId);
  if (stakeIndex === -1) throw new Error('Stake not found');
  
  const stake = userData.stakes[stakeIndex];
  
  // Calculate reward to claim (based on time elapsed)
  const now = new Date();
  const stakeStart = stake.startDate instanceof Timestamp ? stake.startDate.toDate() : stake.startDate;
  const elapsedDays = Math.floor((now.getTime() - stakeStart.getTime()) / (24 * 60 * 60 * 1000));
  const maxDays = stake.duration;
  const claimableDays = Math.min(elapsedDays, maxDays);
  
  const rewardPerDay = stake.totalReward / maxDays;
  const claimableReward = rewardPerDay * claimableDays;
  
  // Update stake
  const updatedStakes = [...userData.stakes];
  updatedStakes[stakeIndex] = {
    ...stake,
    claimedReward: stake.claimedReward + claimableReward,
  };
  
  // Add reward to trading balance
  const newBalance = userData.tradingBalance + claimableReward;
  
  await updateDoc(userRef, {
    stakes: updatedStakes,
    tradingBalance: newBalance,
    totalEarned: userData.totalEarned + claimableReward,
  });
  
  // Add transaction
  await addTransaction(uid, {
    type: 'in',
    category: 'staking',
    title: `Staking Reward - ${stake.packageName}`,
    amount: claimableReward,
    balanceAfter: newBalance,
    status: 'completed',
  });
  
  return claimableReward;
}

// ============= REFERRAL FUNCTIONS =============
async function processReferralBonus(referrerCode: string, newUserId: string): Promise<void> {
  // Find referrer by referral code
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  
  const q = query(collection(db, 'users'), where('referralCode', '==', referrerCode.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return;
  
  const referrerDoc = snapshot.docs[0];
  const referrerData = referrerDoc.data() as UserData;
  
  const bonus = 10; // 10 ASH bonus
  const commission = 5; // 5% commission
  
  // Update referrer
  await updateDoc(doc(db, 'users', referrerDoc.id), {
    referralCount: (referrerData.referralCount || 0) + 1,
    totalReferralEarnings: (referrerData.totalReferralEarnings || 0) + bonus,
    tradingBalance: (referrerData.tradingBalance || 0) + bonus,
  });
}

export async function claimReferralCommission(uid: string, amount: number): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userData = await getUserData(uid);
  
  if (!userData) throw new Error('User not found');
  
  const newBalance = userData.tradingBalance + amount;
  
  await updateDoc(userRef, {
    tradingBalance: newBalance,
  });
  
  await addTransaction(uid, {
    type: 'in',
    category: 'referral',
    title: 'Referral Commission',
    amount,
    balanceAfter: newBalance,
    status: 'completed',
  });
}

// ============= TASK FUNCTIONS =============
export async function completeTask(uid: string, taskId: string, reward: number): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userData = await getUserData(uid);
  
  if (!userData) throw new Error('User not found');
  
  if (userData.completedTasks.includes(taskId)) {
    throw new Error('Task already completed');
  }
  
  const newBalance = userData.tradingBalance + reward;
  
  await updateDoc(userRef, {
    completedTasks: [...userData.completedTasks, taskId],
    tradingBalance: newBalance,
    totalTaskEarnings: (userData.totalTaskEarnings || 0) + reward,
  });
  
  await addTransaction(uid, {
    type: 'in',
    category: 'task',
    title: 'Task Completed',
    amount: reward,
    balanceAfter: newBalance,
    status: 'completed',
  });
}

export async function dailyCheckIn(uid: string, reward: number): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userData = await getUserData(uid);
  
  if (!userData) throw new Error('User not found');
  
  const lastCheckIn = userData.lastDailyCheckIn;
  const now = new Date();
  
  // Check if already checked in today
  if (lastCheckIn) {
    const lastDate = lastCheckIn instanceof Timestamp ? lastCheckIn.toDate() : lastCheckIn;
    if (lastDate.toDateString() === now.toDateString()) {
      return false; // Already checked in today
    }
  }
  
  const newBalance = userData.tradingBalance + reward;
  
  await updateDoc(userRef, {
    lastDailyCheckIn: Timestamp.fromDate(now),
    tradingBalance: newBalance,
    totalTaskEarnings: (userData.totalTaskEarnings || 0) + reward,
  });
  
  await addTransaction(uid, {
    type: 'in',
    category: 'task',
    title: 'Daily Check-in',
    amount: reward,
    balanceAfter: newBalance,
    status: 'completed',
  });
  
  return true;
}

// ============= TRANSACTION HISTORY =============
export async function getTransactions(uid: string, limit: number = 50): Promise<Transaction[]> {
  const { collection, query, orderBy, limit: firestoreLimit, getDocs } = await import('firebase/firestore');
  
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limit)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Transaction);
}

export function subscribeToTransactions(
  uid: string,
  callback: (transactions: Transaction[]) => void,
  limit: number = 50
): () => void {
  const { collection, query, orderBy, limit: firestoreLimit, onSnapshot } = require('firebase/firestore');
  
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limit)
  );
  
  const unsub = onSnapshot(q, (snapshot: any) => {
    const transactions = snapshot.docs.map((doc: any) => doc.data() as Transaction);
    callback(transactions);
  });
  
  return unsub;
}
