import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import RequireAuth from '../components/RequireAuth';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  size?: number;
}) {
  return <Ionicons style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <RequireAuth>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.muted,
          tabBarStyle: {
            backgroundColor: Colors.background,
          },
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTitleStyle: {
            color: Colors.text,
          },
        }}>
        <Tabs.Screen
          name="upload"
          options={{
            title: 'Upload',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="cloud-upload" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color }) => <TabBarIcon name="time" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          }}
        />
      </Tabs>
    </RequireAuth>
  );
}
