import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { 
  Star, 
  Heart, 
  Smile, 
  Compass, 
  MessageCircle, 
  Bug, 
  Bell, 
  Crown, 
  ShoppingCart, 
  Home, 
  Gift, 
  Coffee,
  CheckSquare 
} from 'lucide-react-native';

// Icon name to component mapping
const iconMap: Record<string, any> = {
  'Star': Star,
  'Heart': Heart,
  'Smile': Smile,
  'Compass': Compass,
  'MessageCircle': MessageCircle,
  'Bug': Bug,
  'Bell': Bell,
  'Crown': Crown,
  'ShoppingCart': ShoppingCart,
  'Home': Home,
  'Gift': Gift,
  'Coffee': Coffee,
  'CheckSquare': CheckSquare,
};

export interface Category {
  id: string;
  name: string;
  description?: string;
  tagline?: string;
  icon_name: string;
  icon: any; // React component
  color: string;
  sort_order: number;
  category_type: 'appreciation' | 'favor' | 'special';
  is_active: boolean;
}

export const useCategories = (type?: string) => {
  return useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
        
      if (type) {
        query = query.eq('category_type', type);
      }
      
      const { data, error } = await query.order('sort_order');
      if (error) throw error;
      
      // Map icon names to components
      return (data || []).map(cat => ({
        ...cat,
        icon: iconMap[cat.icon_name] || Star
      }));
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};