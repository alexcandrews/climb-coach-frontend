import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import UploadScreen from "../app/(tabs)/upload";
import LogoutScreen from "../app/(auth)/logout";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Upload" component={UploadScreen} />
            <Tab.Screen name="Logout" component={LogoutScreen} />
        </Tab.Navigator>
    );
}