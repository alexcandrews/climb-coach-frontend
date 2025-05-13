import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TailwindExample from '@/components/TailwindExample';

export default function TailwindScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{
          title: 'Tailwind CSS',
          headerShown: true,
        }}
      />
      <TailwindExample />
    </SafeAreaView>
  );
} 