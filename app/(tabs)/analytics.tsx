import { Redirect } from 'expo-router';

export default function AnalyticsScreen() {
  // Redirect to the More screen where analytics is now located
  return <Redirect href="/more" />;
}