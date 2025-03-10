import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import supabase, { saveSession } from "../../lib/supabase";
import AuthStatus from "../components/AuthStatus";

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signUp({ email, password });
            console.log("Signup response:", data); // Debug log

            if (error) {
                Alert.alert("Sign Up Failed", error.message);
                return;
            }

            // Always show verification message for now since most configurations require it
            Alert.alert(
                "Account Created",
                "Please check your email for verification. Once verified, you can log in.",
                [{ text: "OK", onPress: () => router.push("/login") }]
            );
        } catch (err) {
            console.error("Signup error:", err);
            Alert.alert("Error", "An unexpected error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <AuthStatus />
            <Text>Email:</Text>
            <TextInput 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
                keyboardType="email-address"
                style={{ borderWidth: 1, padding: 10, width: "80%", marginBottom: 15 }} 
            />

            <Text>Password:</Text>
            <TextInput 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                style={{ borderWidth: 1, padding: 10, width: "80%", marginBottom: 20 }} 
            />

            <Button title={loading ? "Signing up..." : "Sign Up"} onPress={handleSignUp} disabled={loading} />
        </View>
    );
}