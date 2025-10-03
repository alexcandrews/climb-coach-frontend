import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import supabase from '../../lib/supabase';
import Colors from '../../constants/Colors';
import LogoHeader from '@/components/LogoHeader';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      // Platform-aware redirect URL
      const redirectTo = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : Linking.createURL('/reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {throw error;}
      setSuccessMessage('Check your email for a password reset link.');
    } catch (err) {
      setErrorMessage('Failed to send password reset email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LogoHeader />
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.instructions}>Enter your email address and we'll send you a link to reset your password.</Text>
        <TextInput
          value={email}
          onChangeText={text => {
            setEmail(text);
            setErrorMessage('');
            setSuccessMessage('');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={Colors.muted}
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, (loading || !email.trim()) && styles.buttonDisabled]}
          onPress={handleForgotPassword}
          disabled={loading || !email.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginLinkContainer} onPress={() => router.replace('/login')}>
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
    zIndex: 1000,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 30,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  instructions: {
    color: Colors.muted,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'PlusJakartaSans_400Regular',
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
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_400Regular',
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
  loginLinkContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
}); 