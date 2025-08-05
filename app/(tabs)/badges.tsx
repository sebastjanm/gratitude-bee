import { Redirect } from 'expo-router';

export default function BadgesScreen() {
  // Redirect to the new Rewards screen
  return <Redirect href="/rewards" />;
}