import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import supabase, { saveSession } from "../../lib/supabase";
import AuthStatus from "../components/AuthStatus";

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
    met: boolean;
}

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [requirements, setRequirements] = useState<PasswordRequirement[]>([
        { label: "At least 8 characters long", test: (p) => p.length >= 8, met: false },
        { label: "Contains a number", test: (p) => /\d/.test(p), met: false },
        { label: "Contains a special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), met: false },
        { label: "Contains an uppercase letter", test: (p) => /[A-Z]/.test(p), met: false },
        { label: "Contains a lowercase letter", test: (p) => /[a-z]/.test(p), met: false },
    ]);

    useEffect(() => {
        // Update requirements status whenever password changes
        setRequirements(prev => prev.map(req => ({
            ...req,
            met: req.test(password)
        })));
    }, [password]);

    const isPasswordValid = () => requirements.every(req => req.met);
    const doPasswordsMatch = () => password === confirmPassword;

    const handleSignUp = async () => {
        try {
            // Validate email
            if (!email.includes('@') || !email.includes('.')) {
                Alert.alert("Invalid Email", "Please enter a valid email address");
                return;
            }

            // Validate password
            if (!isPasswordValid()) {
                Alert.alert("Invalid Password", "Please meet all password requirements");
                return;
            }

            // Check password match
            if (!doPasswordsMatch()) {
                Alert.alert("Password Mismatch", "Passwords do not match");
                return;
            }

            setLoading(true);
            const { data, error } = await supabase.auth.signUp({ email, password });
            console.log("Signup response:", data); // Debug log

            if (error) {
                Alert.alert("Sign Up Failed", error.message);
                return;
            }

            Alert.alert(
                "Email Verification Required",
                `We've sent a verification link to ${email}.\n\n1. Check your email (including spam folder)\n2. Click the verification link\n3. Return here and click 'Back to Login'\n4. Log in with your credentials`,
                [
                    { 
                        text: "Back to Login", 
                        onPress: () => router.push("/login") 
                    },
                    {
                        text: "Resend Email",
                        onPress: async () => {
                            try {
                                const { error } = await supabase.auth.resend({
                                    type: 'signup',
                                    email: email,
                                });
                                if (error) throw error;
                                Alert.alert("Success", "Verification email resent. Please check your inbox.");
                            } catch (err) {
                                Alert.alert("Error", "Failed to resend verification email. Please try again.");
                            }
                        }
                    }
                ]
            );
        } catch (err) {
            console.error("Signup error:", err);
            Alert.alert("Error", "An unexpected error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AuthStatus />
            
            <Text style={styles.label}>Email:</Text>
            <TextInput 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
                keyboardType="email-address"
                style={styles.input}
                placeholder="your@email.com"
            />

            <Text style={styles.label}>Password:</Text>
            <TextInput 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                style={styles.input}
                placeholder="Enter password"
            />

            <Text style={styles.label}>Confirm Password:</Text>
            <TextInput 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry 
                style={[
                    styles.input,
                    confirmPassword && { 
                        borderColor: doPasswordsMatch() ? '#4CAF50' : '#f44336'
                    }
                ]}
                placeholder="Confirm password"
            />

            <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                {requirements.map((req, index) => (
                    <Text 
                        key={index} 
                        style={[
                            styles.requirementText,
                            { color: req.met ? '#4CAF50' : '#666' }
                        ]}
                    >
                        {req.met ? '✓' : '○'} {req.label}
                    </Text>
                ))}
            </View>

            <Button 
                title={loading ? "Signing up..." : "Sign Up"} 
                onPress={handleSignUp} 
                disabled={loading || !isPasswordValid() || !doPasswordsMatch()} 
            />
            
            <View style={styles.backButton}>
                <Button title="Back to Login" onPress={() => router.push("/login")} />
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
    requirementsContainer: {
        width: '80%',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
    },
    requirementsTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    requirementText: {
        fontSize: 12,
        marginBottom: 3,
    },
    backButton: {
        marginTop: 10,
    },
});