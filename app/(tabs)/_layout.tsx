import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Home, BarChart2, Award, Calendar, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated, Easing } from 'react-native';
import { NotificationProvider } from '@/providers/NotificationProvider';

interface AnimatedIconProps {
  focused: boolean;
  icon: React.ComponentType<any>;
  color: string;
  size: number;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ focused, icon: Icon, color, size }) => {
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.25 : 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon color={color} size={size} />
    </Animated.View>
  );
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <NotificationProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF8C42',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            height: 70 + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Inter-Medium',
            marginTop: 0,
            paddingBottom: 5,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon icon={Home} color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="timeline"
          options={{
            title: 'Timeline',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon icon={Calendar} color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="badges"
          options={{
            title: 'Badges',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon icon={Award} color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon icon={BarChart2} color={color} size={size} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <AnimatedIcon icon={User} color={color} size={size} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </NotificationProvider>
  );
}