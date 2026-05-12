import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'ASH COIN STAKING',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#667eea',
    });
  }

  return true;
}

// Schedule a local notification
export async function scheduleNotification(
  title: string,
  body: string,
  seconds: number = 0,
  data?: Record<string, any>
): Promise<string> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permission denied');
    return '';
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });

  return notificationId;
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ============= STAKING NOTIFICATIONS =============

// Notify when staking is complete/mature
export async function notifyStakingComplete(
  packageName: string,
  amount: string,
  reward: string
): Promise<void> {
  await scheduleNotification(
    '🎉 Staking Complete!',
    `Your ${packageName} stake of ${amount} ASH has matured!\nYou earned ${reward} ASH in rewards.`,
    0,
    { type: 'staking_complete', packageName, amount, reward }
  );
}

// Schedule reminder for staking about to mature
export async function scheduleStakingReminder(
  stakeId: string,
  packageName: string,
  secondsUntilMature: number
): Promise<string> {
  // Remind 1 day before
  const reminderTime = secondsUntilMature - (24 * 60 * 60);
  
  if (reminderTime <= 0) return '';

  return await scheduleNotification(
    '⏰ Staking Maturing Soon',
    `Your ${packageName} stake will mature in 24 hours. Don't forget to claim your rewards!`,
    reminderTime,
    { type: 'staking_reminder', stakeId }
  );
}

// ============= TASK NOTIFICATIONS =============

// Daily task reminder
export async function scheduleDailyTaskReminder(): Promise<string> {
  // Schedule for 9 AM every day
  const trigger = new Date();
  trigger.setHours(9, 0, 0, 0);
  
  if (trigger.getTime() < Date.now()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: '✨ Daily Tasks Ready!',
      body: 'Complete your daily tasks and earn ASH rewards. Check in now!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

// Notify task completed
export async function notifyTaskCompleted(taskName: string, reward: string): Promise<void> {
  await scheduleNotification(
    '✅ Task Completed!',
    `You completed "${taskName}" and earned ${reward} ASH!`,
    0,
    { type: 'task_complete', taskName, reward }
  );
}

// ============= WALLET NOTIFICATIONS =============

// Notify withdrawal initiated
export async function notifyWithdrawalInitiated(amount: string): Promise<void> {
  await scheduleNotification(
    '💸 Withdrawal Initiated',
    `Your withdrawal of ${amount} ASH is being processed. Funds will arrive within 1-3 business days.`,
    0,
    { type: 'withdrawal_initiated', amount }
  );
}

// Notify withdrawal received
export async function notifyWithdrawalReceived(amount: string, bankName: string): Promise<void> {
  await scheduleNotification(
    '✅ Withdrawal Complete!',
    `Your withdrawal of ${amount} ASH has been transferred to your ${bankName} account.`,
    0,
    { type: 'withdrawal_received', amount, bankName }
  );
}

// Notify staking reward received
export async function notifyStakingReward(amount: string, packageName: string): Promise<void> {
  await scheduleNotification(
    '💰 Reward Received!',
    `You received ${amount} ASH as staking reward from ${packageName}!`,
    0,
    { type: 'staking_reward', amount, packageName }
  );
}

// Notify referral commission
export async function notifyReferralCommission(amount: string): Promise<void> {
  await scheduleNotification(
    '🎁 Referral Bonus!',
    `You received ${amount} ASH commission from your referral!`,
    0,
    { type: 'referral_commission', amount }
  );
}

// ============= SETUP =============

// Initialize all notifications on app start
export async function initializeNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  
  if (hasPermission) {
    // Schedule daily task reminder
    await scheduleDailyTaskReminder();
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
