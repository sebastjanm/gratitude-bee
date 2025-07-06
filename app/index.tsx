import { Redirect } from 'expo-router';
import { MockAuth } from '@/utils/mockAuth';

export default function Index() {
  const isAuthenticated = MockAuth.isAuthenticated();
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(auth)/splash" />;
}