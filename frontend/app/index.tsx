import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the first tab in the tab layout
  return <Redirect href="/(tabs)" />;
} 