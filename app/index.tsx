import { Redirect } from 'expo-router';

export default function Index() {
  // In a real app, you would check authentication state here
  const isAuthenticated = false;
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(auth)/splash" />;
}