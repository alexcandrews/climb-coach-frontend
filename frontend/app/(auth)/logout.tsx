import React from "react";
import { View, Button, Alert } from "react-native";
import { logoutUser } from "../../lib/supabase";

export default function LogoutScreen({ navigation }) {
    const handleLogout = async () => {
        await logoutUser();
        Alert.alert("Logged Out", "You have been logged out.");
        navigation.replace("Login");
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
}