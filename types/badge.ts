export interface Badge {
  id: string;
  name: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold';
  earnedDate: string;
  description: string;
  icon: any;
  color: string;
  message?: string;
  isNegative?: boolean;
  cancelledBadges?: string[]; // IDs of badges this negative badge cancelled
}

export interface BadgeCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  count: number;
  isNegative?: boolean;
}

export interface TimelineEvent {
  id: string;
  type: 'sent' | 'received';
  badgeName: string;
  category: string;
  message?: string;
  timestamp: string;
  partnerName: string;
  icon: any;
  color: string;
  isNegative?: boolean;
  cancelledBadges?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  partnerId?: string;
  partnerName?: string;
  createdAt: string;
  preferences: {
    notificationsEnabled: boolean;
    reminderTime: string;
    weeklyGoal: number;
  };
}

export interface AppStreak {
  currentStreak: number;
  longestStreak: number;
  totalBadgesSent: number;
  totalBadgesReceived: number;
  lastActivityDate: string;
}