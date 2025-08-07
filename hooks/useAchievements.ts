import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { 
  Star, 
  Heart, 
  Trophy,
  TrendingUp,
  Target,
  HelpingHand,
  MessageCircle,
  BookOpen,
  Calendar,
  Crown,
  Flame,
  Fire
} from 'lucide-react-native';
import { Colors } from '@/utils/design-system';

// Icon mapping for achievement types
const iconMap: Record<string, any> = {
  'Heart': Heart,
  'Crown': Crown,
  'Calendar': Calendar,
  'Fire': Fire,
  'Flame': Flame,
  'HelpingHand': HelpingHand,
  'MessageCircle': MessageCircle,
  'BookOpen': BookOpen,
  'Star': Star,
  'Trophy': Trophy,
  'TrendingUp': TrendingUp,
  'Target': Target,
};

// Color mapping for achievement categories - vibrant colors
const colorMap: Record<string, string> = {
  'appreciation': '#FF6B6B',  // Warm red/pink for love and appreciation
  'milestone': '#4ECDC4',     // Teal for milestones
  'streak': '#FFE66D',        // Bright yellow for streaks
  'favor': '#95E77E',         // Light green for helping
  'communication': '#A8E6CF', // Mint green for communication
  'wisdom': '#C7B8FF',        // Lavender for wisdom
};

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: any;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  color: string;
  reward?: string;
}

export const useAchievements = (userId?: string) => {
  return useQuery<Achievement[]>({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');
        userId = user.id;
      }

      // Fetch user's achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId);

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        throw achievementsError;
      }

      // Fetch all achievement definitions to show locked ones too
      const { data: allDefinitions, error: definitionsError } = await supabase
        .from('achievement_definitions')
        .select('*');

      if (definitionsError) {
        console.error('Error fetching achievement definitions:', definitionsError);
        throw definitionsError;
      }

      console.log('Achievements fetched:', achievements?.length || 0);
      console.log('Definitions fetched:', allDefinitions?.length || 0);

      // Create a map of user achievements
      const userAchievementsMap = new Map(
        (achievements || []).map(a => [a.achievement_type, a])
      );

      // Combine user progress with definitions
      return (allDefinitions || []).map(def => {
        const userAchievement = userAchievementsMap.get(def.type);
        
        return {
          id: def.type,
          type: def.type,
          name: def.name,
          description: def.description,
          icon: iconMap[def.icon_name] || Star,
          progress: userAchievement?.progress || 0,
          target: def.target,
          unlocked: !!userAchievement?.unlocked_at,
          unlockedAt: userAchievement?.unlocked_at,
          color: colorMap[def.category] || Colors.textSecondary,
          reward: def.reward_points ? `${def.reward_points} bonus points` : undefined,
        };
      });
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: !!userId || true, // Always enabled, will fetch current user if no userId
  });
};