import React, { useState, useEffect } from "react";
import { View, TextInput, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, Image } from "react-native";
import { useRouter } from "expo-router";
import supabase, { saveSession } from "../../lib/supabase";
import Colors from "../../constants/Colors";

export default function SignUpScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
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

    const handleSignUp = async () => {
        try {
            setErrorMessage("");

            // Basic validation
            if (!name.trim() || !email.trim() || !password.trim()) {
                setErrorMessage("Please fill in all fields");
                return;
            }

            if (!validateEmail(email)) {
                setErrorMessage("Please enter a valid email address");
                return;
            }

            setLoading(true);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    }
                }
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            Alert.alert(
                "Email Verification Required",
                `We've sent a verification link to ${email}.\n\nPlease check your email and click the verification link to complete signup.`,
                [{ text: "OK" }]
            );
            
            router.push("/login");
        } catch (err) {
            console.error("Signup error:", err);
            setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoWrapper}>
                        {/* Stylized curved line logo */}
                        <View style={styles.logoLine1} />
                        <View style={styles.logoLine2} />
                    </View>
                    <Text style={styles.logoText}>2Beta</Text>
                </View>
                <Text style={styles.title}>Sign Up</Text>
                
                <TextInput 
                    value={name} 
                    onChangeText={(text) => {
                        setName(text);
                        setErrorMessage("");
                    }}
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor={Colors.muted}
                />

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
                    placeholderTextColor={Colors.muted}
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
                    placeholderTextColor={Colors.muted}
                />

                {errorMessage ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <TouchableOpacity 
                    style={[styles.button, (loading || !name.trim() || !email.trim() || !password.trim()) && styles.buttonDisabled]} 
                    onPress={handleSignUp}
                    disabled={loading || !name.trim() || !email.trim() || !password.trim()}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Create account</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.loginLinkContainer} onPress={() => router.push("/login")}>
                    <Text style={styles.link}>Back to log in</Text>
                </TouchableOpacity>
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
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        height: 100,
    },
    logoWrapper: {
        width: 80,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    logoLine1: {
        position: 'absolute',
        width: 60,
        height: 10,
        backgroundColor: Colors.accent,
        borderRadius: 10,
        transform: [{ rotate: '30deg' }, { translateY: -5 }],
    },
    logoLine2: {
        position: 'absolute',
        width: 60,
        height: 10,
        backgroundColor: Colors.accent,
        borderRadius: 10,
        transform: [{ rotate: '-20deg' }, { translateY: 10 }],
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: 8,
    },
    title: {
        fontSize: 30,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        backgroundColor: Colors.dark.background,
        color: Colors.text,
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
        color: Colors.error,
        textAlign: 'center',
        marginBottom: 5,
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
    },
    loginLinkContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    link: {
        color: Colors.text,
        fontSize: 14,
    },
});