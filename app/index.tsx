import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import supabase from '../lib/supabase';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/upload');
      } else {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  // Optionally show a loading spinner while redirecting
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
} 