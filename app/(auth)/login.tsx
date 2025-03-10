import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import supabase, { saveSession } from "../../lib/supabase";
import AuthStatus from "../components/AuthStatus";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            Alert.alert("Login Failed", error.message);
        } else {
            await saveSession(data.session);
            Alert.alert("Login Successful", "Welcome!");
            router.replace("/upload"); // Redirect to Upload page
        }

        setLoading(false);
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <AuthStatus />
            <Text>Email:</Text>
            <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 10, width: "80%" }} />

            <Text>Password:</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 10, width: "80%" }} />

            <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
            <Button title="Sign Up" onPress={() => router.push("/signup")} />
        </View>
    );
}