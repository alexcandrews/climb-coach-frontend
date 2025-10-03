import React, { useState, useEffect } from "react";
import { View, TextInput, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import supabase from "../../lib/supabase";
import Colors from "../../constants/Colors";
import LogoHeader from "@/components/LogoHeader";
import * as Linking from "expo-linking";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showVerifyMsg, setShowVerifyMsg] = useState(false);
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        if (params.verify === "1") {
            setShowVerifyMsg(true);
        }
    }, [params.verify]);

    const validateEmail = (email: string) => {
        // Simple email validation
        return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };

    const handleForgotPassword = async () => {
        if (!email.trim() || !validateEmail(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const redirectTo = Linking.createURL('/reset-password');
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) {throw error;}
            Alert.alert(
                "Password Reset Email Sent",
                "Check your email for a password reset link."
            );
        } catch (err) {
            console.error("Password reset error:", err);
            setErrorMessage("Failed to send password reset email. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email.trim() || !validateEmail(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            // Make sure to adapt this based on the actual Supabase API
            await supabase.auth.resend({
                type: 'signup',
                email,
            });
            Alert.alert("Verification Email Sent", "Please check your email for the verification link.");
        } catch (err) {
            console.error("Resend verification error:", err);
            setErrorMessage("Failed to resend verification email. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        // Basic validation
        if (!email.trim() || !password.trim()) {
            setErrorMessage("Please enter both email and password.");
            return;
        }

        if (!validateEmail(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                if (error.message.includes("Email not confirmed")) {
                    setErrorMessage("Email not verified. Please check your inbox for a verification link.");
                } else {
                    setErrorMessage("Incorrect email or password. Please try again.");
                }
                return;
            }

            if (data?.session) {
                // Supabase automatically persists session via storage adapter
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
            <View style={styles.content}>
                <LogoHeader />
                <Text style={styles.title}>Login</Text>

                {showVerifyMsg && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>Check your email to verify your account before logging in.</Text>
                    </View>
                )}
                <TextInput 
                    value={email} 
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrorMessage("");
                        setShowVerifyMsg(false);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={Colors.muted}
                />

                <TextInput 
                    value={password} 
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrorMessage("");
                        setShowVerifyMsg(false);
                    }}
                    secureTextEntry 
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.muted}
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

                <TouchableOpacity 
                    style={[styles.button, (loading || !email.trim() || !password.trim()) && styles.buttonDisabled]} 
                    onPress={handleLogin}
                    disabled={loading || !email.trim() || !password.trim()}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Log in</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.link}>Forgot password?</Text>
                </TouchableOpacity>

                <View style={styles.bottomContainer}>
                    <Text style={styles.signupText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push("/signup")}> 
                        <Text style={styles.signupLink}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000, // Make sure it's above any header
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        justifyContent: "center",
        maxWidth: 360,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        fontSize: 30,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: 'SpaceGrotesk_700Bold',
    },
    input: {
        backgroundColor: Colors.dark.background,
        color: Colors.text,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginBottom: 16,
        fontSize: 16,
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    infoContainer: {
        backgroundColor: '#e6f7ff',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    infoText: {
        color: '#0077b6',
        fontSize: 15,
        textAlign: 'center',
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    errorContainer: {
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    errorText: {
        color: Colors.error,
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    helpLink: {
        color: Colors.accent,
        textDecorationLine: 'underline',
        marginTop: 5,
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    button: {
        backgroundColor: Colors.accent,
        paddingVertical: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'PlusJakartaSans_500Medium',
    },
    forgotPasswordContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    link: {
        color: Colors.text,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        paddingBottom: 40,
    },
    signupText: {
        color: Colors.muted,
        fontSize: 14,
        fontFamily: 'PlusJakartaSans_400Regular',
    },
    signupLink: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
        fontFamily: 'PlusJakartaSans_500Medium',
    }
}); 
