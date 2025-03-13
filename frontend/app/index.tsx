import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import supabase from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading indicator while checking authentication
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={{ marginTop: 10, color: Colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication status
  return isAuthenticated ? <Redirect href="/(tabs)/upload" /> : <Redirect href="/login" />;
} 