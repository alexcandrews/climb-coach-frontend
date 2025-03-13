import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import UploadScreen from "../app/(tabs)/upload";
import HistoryScreen from "../app/(tabs)/history";
import LogoutScreen from "../app/(auth)/logout";
import { Colors } from '@/constants/Colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: Colors.primary.main,
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    borderTopColor: '#eee',
                },
            }}
        >
            <Tab.Screen 
                name="Upload" 
                component={UploadScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cloud-upload" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen 
                name="History" 
                component={HistoryScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen 
                name="Settings" 
                component={LogoutScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}