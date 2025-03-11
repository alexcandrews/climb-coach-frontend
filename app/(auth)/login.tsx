import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import supabase, { saveSession } from "../../lib/supabase";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const validateEmail = (email: string) => {
        return email.includes('@') && email.includes('.');
    };

    const handleForgotPassword = async () => {
        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (resetError) throw resetError;
            Alert.alert(
                "Password Reset Email Sent",
                "Please check your email for password reset instructions.",
                [{ text: "OK" }]
            );
        } catch (err) {
            setErrorMessage("Failed to send password reset email. Please try again.");
        }
    };

    const handleResendVerification = async () => {
        try {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });
            if (resendError) throw resendError;
            Alert.alert("Success", "Verification email resent. Please check your inbox.");
        } catch (err) {
            setErrorMessage("Failed to resend verification email. Please try again.");
        }
    };

    const handleLogin = async () => {
        try {
            setErrorMessage("");

            // Basic validation
            if (!email.trim() || !password.trim()) {
                setErrorMessage("Please enter both email and password");
                return;
            }

            if (!validateEmail(email)) {
                setErrorMessage("Please enter a valid email address");
                return;
            }

            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setErrorMessage("Incorrect email or password");
                } else if (error.message.includes('Email not confirmed')) {
                    setErrorMessage("Email not verified. Please verify your email to continue.");
                } else {
                    setErrorMessage(error.message);
                }
                return;
            }

            if (data?.session) {
                await saveSession(data.session);
                router.replace("/upload");
            } else {
                setErrorMessage("No session created. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back!</Text>
            
            <Text style={styles.label}>Email:</Text>
            <TextInput 
                value={email} 
                onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                placeholder="your@email.com"
            />

            <Text style={styles.label}>Password:</Text>
            <TextInput 
                value={password} 
                onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage("");
                }}
                secureTextEntry 
                style={styles.input}
                placeholder="Enter password"
            />

            {errorMessage ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                    {errorMessage.includes("Incorrect email or password") && (
                        <TouchableOpacity onPress={handleForgotPassword}>
                            <Text style={styles.helpLink}>Forgot Password?</Text>
                        </TouchableOpacity>
                    )}
                    {errorMessage.includes("Email not verified") && (
                        <TouchableOpacity onPress={handleResendVerification}>
                            <Text style={styles.helpLink}>Resend Verification Email</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : null}

            <Button 
                title={loading ? "Logging in..." : "Login"} 
                onPress={handleLogin} 
                disabled={loading || !email.trim() || !password.trim()} 
            />
            
            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <Button title="Sign Up" onPress={() => router.push("/signup")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    label: {
        alignSelf: 'flex-start',
        marginLeft: '10%',
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: "80%",
        marginBottom: 15,
        borderRadius: 5,
    },
    errorContainer: {
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    errorText: {
        color: '#f44336',
        textAlign: 'center',
        marginBottom: 5,
    },
    helpLink: {
        color: '#2196F3',
        textDecorationLine: 'underline',
        marginTop: 5,
    },
    signupContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    signupText: {
        marginBottom: 10,
        color: '#666',
    },
});