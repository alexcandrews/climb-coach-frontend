import React, { useState, useEffect } from "react";
import { View, TextInput, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import supabase, { saveSession } from "../../lib/supabase";

// Brand color palette
const colors = {
  background: '#12181F',      // Very dark blue/black background
  inputBg: '#1A2129',         // Dark input background
  accent: '#3D9DB3',          // Blue accent color to match logo in screenshot
  text: '#E6EFF4',            // Light text color
  muted: '#8A8F98',           // Muted text color
  error: '#f44336',           // Error color
};

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Hide status bar for this screen
    useEffect(() => {
        StatusBar.setHidden(true);
        return () => {
            StatusBar.setHidden(false);
        };
    }, []);

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
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>2Beta</Text>
                </View>
                <Text style={styles.title}>Login</Text>
                
                <TextInput 
                    value={email} 
                    onChangeText={(text) => {
                        setEmail(text);
                        setErrorMessage("");
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={colors.muted}
                />

                <TextInput 
                    value={password} 
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrorMessage("");
                    }}
                    secureTextEntry 
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.muted}
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
                
                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={handleForgotPassword}>
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
        backgroundColor: colors.background,
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
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        height: 60,
    },
    logo: {
        fontSize: 42,
        fontWeight: 'bold',
        color: colors.accent,
        textAlign: 'center',
    },
    title: {
        fontSize: 30,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        backgroundColor: colors.inputBg,
        color: colors.text,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginBottom: 16,
        fontSize: 16,
    },
    errorContainer: {
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        marginBottom: 5,
    },
    helpLink: {
        color: colors.accent,
        textDecorationLine: 'underline',
        marginTop: 5,
    },
    button: {
        backgroundColor: colors.accent,
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
    },
    forgotPasswordContainer: {
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    link: {
        color: colors.text,
        fontSize: 14,
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        paddingBottom: 40,
    },
    signupText: {
        color: colors.muted,
        fontSize: 14,
    },
    signupLink: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    }
}); 