import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Import global styles for Tailwind CSS
import '../global.css';

// Import the Google fonts
// Space Grotesk - Used for headings, titles, and emphasis text
// A geometric sans-serif with a modern, technical feel
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

// Plus Jakarta Sans - Used for body text, UI elements, and general content
// A versatile, highly readable sans-serif with a friendly feel
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { useColorScheme } from '@/components/useColorScheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Export our custom ErrorBoundary for expo-router to use
export { ErrorBoundary };

// In newer versions of expo-router, ErrorBoundary is no longer exported directly
// The error handling is now built into the router by default
export const unstable_settings = {
  // Ensure that reloading on /modal/index works
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load all the application fonts in one place to ensure consistent typography throughout the app
  // These fonts are referenced in the Typography.ts constants file
  const [loaded, error] = useFonts({
    // Legacy font for backward compatibility
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Font Awesome icons
    ...FontAwesome.font,
    // Brand font for headings: Space Grotesk
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    // Brand font for body text: Plus Jakarta Sans
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
