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
          tabBarActiveTintColor: Colors.text,
          tabBarInactiveTintColor: 'rgba(230, 239, 244, 0.6)',
          tabBarStyle: {
            backgroundColor: Colors.accent,
            borderTopWidth: 0,
            elevation: 0,
            height: 65,
            paddingVertical: 5,
          },
          tabBarItemStyle: {
            paddingVertical: 5,
          },
          tabBarIconStyle: {
            width: 24,
            height: 24,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 0,
            marginBottom: 4,
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
            tabBarIcon: ({ color }) => <TabBarIcon name="cloud-upload" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="time" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} size={22} />,
          }}
        />
      </Tabs>
    </RequireAuth>
  );
}
