import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CheckCircle2,
  Circle,
  Gift,
  Eye,
  Share2,
  Bell,
  Star,
  Trophy,
  Zap,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Camera,
  Globe,
  Video,
  MessageCircle,
  Heart,
  BarChart2,
  Send,
} from 'lucide-react-native';
import { notifyTaskCompleted, scheduleDailyTaskReminder } from '../../src/services/notifications';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'social' | 'watch' | 'engagement' | 'special';
  icon: React.ReactNode;
  color: string;
  action: string;
  points: number;
}

interface TaskCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  tasks: Task[];
}

const TASKS: TaskCategory[] = [
  {
    id: 'social',
    name: 'Social Tasks',
    icon: <Share2 size={20} color="#667eea" />,
    tasks: [
      {
        id: '1',
        title: 'Follow on X',
        description: 'Follow our official X (Twitter) account',
        reward: 5,
        type: 'social',
        icon: <Star size={24} color="#1DA1F2" />,
        color: '#1DA1F2',
        action: 'follow_twitter',
        points: 10,
      },
      {
        id: '2',
        title: 'Share on X',
        description: 'Share ASH STAKING with your followers',
        reward: 10,
        type: 'social',
        icon: <Send size={24} color="#1DA1F2" />,
        color: '#1DA1F2',
        action: 'share_twitter',
        points: 20,
      },
      {
        id: '3',
        title: 'Join Telegram',
        description: 'Join our official Telegram community',
        reward: 8,
        type: 'social',
        icon: <MessageCircle size={24} color="#0088cc" />,
        color: '#0088cc',
        action: 'join_telegram',
        points: 15,
      },
      {
        id: '4',
        title: 'Like Instagram Post',
        description: 'Like our latest post on Instagram',
        reward: 5,
        type: 'social',
        icon: <Heart size={24} color="#E4405F" />,
        color: '#E4405F',
        action: 'like_instagram',
        points: 10,
      },
    ],
  },
  {
    id: 'watch',
    name: 'Watch & Learn',
    icon: <Video size={20} color="#f5576c" />,
    tasks: [
      {
        id: '5',
        title: 'Watch Video',
        description: 'Watch our promotional video (30 seconds)',
        reward: 3,
        type: 'watch',
        icon: <Video size={24} color="#f5576c" />,
        color: '#f5576c',
        action: 'watch_video',
        points: 10,
      },
      {
        id: '6',
        title: 'Watch Tutorial',
        description: 'Complete the staking tutorial video',
        reward: 5,
        type: 'watch',
        icon: <BarChart2 size={24} color="#f5576c" />,
        color: '#f5576c',
        action: 'watch_tutorial',
        points: 20,
      },
    ],
  },
  {
    id: 'engagement',
    name: 'Daily Engagement',
    icon: <Zap size={20} color="#ffd700" />,
    tasks: [
      {
        id: '7',
        title: 'Daily Check-in',
        description: 'Open the app and check in',
        reward: 2,
        type: 'engagement',
        icon: <Bell size={24} color="#ffd700" />,
        color: '#ffd700',
        action: 'daily_checkin',
        points: 5,
      },
      {
        id: '8',
        title: 'View Dashboard',
        description: 'View your dashboard 3 times today',
        reward: 1,
        type: 'engagement',
        icon: <Eye size={24} color="#ffd700" />,
        color: '#ffd700',
        action: 'view_dashboard',
        points: 5,
      },
      {
        id: '9',
        title: 'Share App Link',
        description: 'Share your referral link today',
        reward: 5,
        type: 'engagement',
        icon: <Share2 size={24} color="#ffd700" />,
        color: '#ffd700',
        action: 'share_link',
        points: 15,
      },
    ],
  },
  {
    id: 'special',
    name: 'Special Rewards',
    icon: <Trophy size={20} color="#43e97b" />,
    tasks: [
      {
        id: '10',
        title: 'First Stake',
        description: 'Complete your first staking',
        reward: 50,
        type: 'special',
        icon: <TrendingUp size={24} color="#43e97b" />,
        color: '#43e97b',
        action: 'first_stake',
        points: 100,
      },
      {
        id: '11',
        title: 'Refer 3 Friends',
        description: 'Invite 3 friends to join',
        reward: 100,
        type: 'special',
        icon: <Users size={24} color="#43e97b" />,
        color: '#43e97b',
        action: 'refer_three',
        points: 200,
      },
      {
        id: '12',
        title: 'Complete Profile',
        description: 'Fill in all profile information',
        reward: 20,
        type: 'special',
        icon: <Camera size={24} color="#43e97b" />,
        color: '#43e97b',
        action: 'complete_profile',
        points: 50,
      },
    ],
  },
];

export default function TasksScreen() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [totalEarned, setTotalEarned] = useState(45.50);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleTaskComplete = async (task: Task) => {
    if (completedTasks.includes(task.id)) {
      Alert.alert('Already Completed', 'You have already completed this task.');
      return;
    }

    Alert.alert(
      'Complete Task',
      `Complete "${task.title}" and earn ${task.reward} ASH?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setCompletedTasks([...completedTasks, task.id]);
            setTotalEarned(totalEarned + task.reward);
            
            // Send notification
            await notifyTaskCompleted(task.title, task.reward.toString());
            
            Alert.alert('Success!', `You earned ${task.reward} ASH!`);
          },
        },
      ]
    );
  };

  const handleTaskAction = (task: Task) => {
    switch (task.action) {
      case 'follow_twitter':
      case 'share_twitter':
        Linking.openURL('https://twitter.com/ashstaking');
        break;
      case 'join_telegram':
        Linking.openURL('https://t.me/ashstaking');
        break;
      case 'like_instagram':
        Linking.openURL('https://instagram.com/ashstaking');
        break;
      default:
        handleTaskComplete(task);
    }
  };

  const allTasks = TASKS.flatMap(cat => cat.tasks);
  const completedCount = completedTasks.length;
  const totalTasks = allTasks.length;

  const renderTask = (task: Task) => {
    const isCompleted = completedTasks.includes(task.id);
    
    return (
      <TouchableOpacity
        key={task.id}
        style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
        onPress={() => handleTaskAction(task)}
        activeOpacity={0.8}
      >
        <View style={[styles.taskIconContainer, { backgroundColor: task.color + '20' }]}>
          {task.icon}
        </View>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
            {task.title}
          </Text>
          <Text style={styles.taskDescription}>{task.description}</Text>
          <View style={styles.taskReward}>
            <DollarSign size={14} color="#4caf50" />
            <Text style={styles.rewardText}>+{task.reward} ASH</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={() => handleTaskComplete(task)}
        >
          {isCompleted ? (
            <CheckCircle2 size={28} color="#4caf50" />
          ) : (
            <Circle size={28} color="#8e8e93" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily Tasks</Text>
          <View style={styles.progressPill}>
            <Zap size={16} color="#ffd700" />
            <Text style={styles.progressText}>{completedCount}/{totalTasks}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <LinearGradient
          colors={['#ffd700', '#ffed4a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Trophy size={24} color="#1c1c1e" />
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Gift size={24} color="#1c1c1e" />
              <Text style={styles.statValue}>{totalEarned.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(completedCount / totalTasks) * 100}%` }
              ]} 
            />
          </View>
        </LinearGradient>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          <TouchableOpacity
            style={[styles.categoryTab, selectedCategory === 'all' && styles.categoryTabActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryTabText, selectedCategory === 'all' && styles.categoryTabTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {TASKS.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryTab, selectedCategory === category.id && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={styles.categoryTabContent}>
                {category.icon}
                <Text style={[styles.categoryTabText, selectedCategory === category.id && styles.categoryTabTextActive]}>
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tasks List */}
        {selectedCategory === 'all' ? (
          TASKS.map((category) => (
            <View key={category.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  {category.icon}
                  <Text style={styles.sectionTitle}>{category.name}</Text>
                </View>
              </View>
              {category.tasks.map(renderTask)}
            </View>
          ))
        ) : (
          <View style={styles.section}>
            {TASKS.find(c => c.id === selectedCategory)?.tasks.map(renderTask)}
          </View>
        )}
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
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1c1c1e',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#1c1c1e',
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 4,
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  categoryTab: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabActive: {
    backgroundColor: '#667eea',
  },
  categoryTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  taskCardCompleted: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  taskIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8e8e93',
  },
  taskDescription: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
  taskReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4caf50',
  },
  completeButton: {
    marginLeft: 12,
  },
});
