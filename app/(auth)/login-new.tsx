import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useFonts, PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans';
import { useRouter } from "expo-router";
import supabase, { saveSession } from "../../lib/supabase";

// Brand color palette
const colors = {
  background: '#22303C',
  accent: '#3E6E68',
  text: '#E6EFF4',
  muted: '#A0A8A3',
  error: '#f44336',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
  });

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (resendError) throw resendError;
      Alert.alert("Success", "Verification email resent. Please check your inbox.");
    } catch (err) {
      setErrorMessage("Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
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

  if (!fontsLoaded) {
    return <View style={styles.container}><ActivityIndicator color={colors.accent} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>2Beta</Text>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrorMessage("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.muted}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrorMessage("");
        }}
        secureTextEntry
      />

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          {errorMessage.includes("Incorrect email or password") && (
            <TouchableOpacity onPress={handleResendVerification}>
              <Text style={styles.link}>Resend Verification Email</Text>
            </TouchableOpacity>
          )}
          {errorMessage.includes("Email not verified") && (
            <TouchableOpacity onPress={handleResendVerification}>
              <Text style={styles.link}>Resend Verification Email</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <TouchableOpacity 
        style={[styles.button, (loading || !email.trim() || !password.trim()) && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading || !email.trim() || !password.trim()}
      >
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Log in"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logo: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 32,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    fontFamily: 'PlusJakartaSans_400Regular',
    backgroundColor: '#2E3A46',
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#fff',
    fontSize: 16,
  },
  link: {
    fontFamily: 'PlusJakartaSans_400Regular',
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_400Regular',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 5,
  },
});
