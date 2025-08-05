import { Redirect } from 'expo-router';

export default function ProfileScreen() {
  // Redirect to the new More screen
  return <Redirect href="/more" />;
}