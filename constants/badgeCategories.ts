import { Heart, Star, Smile, Compass, MessageCircle, Bug, Crown, CircleCheck as CheckCircle, Chrome as Home } from 'lucide-react-native';
import { BadgeCategory } from '@/types/badge';

export const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: 'kindness',
    name: 'Kindness',
    icon: Heart,
    color: '#FF6B9D',
    description: 'Gentle caring actions',
    count: 0,
  },
  {
    id: 'support',
    name: 'Support',
    icon: Star,
    color: '#4ECDC4',
    description: 'Being there when needed',
    count: 0,
  },
  {
    id: 'humor',
    name: 'Humor',
    icon: Smile,
    color: '#FFD93D',
    description: 'Bringing joy with laughter',
    count: 0,
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: Compass,
    color: '#6BCF7F',
    description: 'Shared experiences',
    count: 0,
  },
  {
    id: 'words',
    name: 'Love Notes',
    icon: MessageCircle,
    color: '#A8E6CF',
    description: 'Words of affirmation',
    count: 0,
  },
  {
    id: 'whatever-you-say',
    name: 'Whatever You Say',
    icon: CheckCircle,
    color: '#9B59B6',
    description: 'So be it moments',
    count: 0,
  },
  {
    id: 'yes-dear',
    name: 'Yes, Dear',
    icon: Crown,
    color: '#E67E22',
    description: 'Agreeable responses',
    count: 0,
  },
  {
    id: 'happy-wife',
    name: 'Happy Wife, Happy Life',
    icon: Home,
    color: '#27AE60',
    description: 'Relationship wisdom',
    count: 0,
  },
  {
    id: 'dont-panic',
    name: 'Don\'t Panic',
    icon: Heart,
    color: '#6366F1',
    description: 'Calm reassurance after stress',
    count: 0,
  },
];

export const NEGATIVE_BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: 'hornet',
    name: 'Hornet',
    icon: Bug,
    color: '#FF4444',
    description: 'Cancels positive badges',
    count: 0,
    isNegative: true,
  },
];

export const BADGE_TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
};

export const BADGE_TIER_EMOJIS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
};