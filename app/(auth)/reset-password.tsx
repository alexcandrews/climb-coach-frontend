import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import supabase from '../../lib/supabase';
import Colors from '../../constants/Colors';
import LogoHeader from '@/components/LogoHeader';

function getTokensFromHash() {
  if (typeof window === 'undefined') return { access_token: '', refresh_token: '' };
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    access_token: params.get('access_token') || '',
    refresh_token: params.get('refresh_token') || '',
  };
}

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function handleSession() {
      setLoading(true);
      setErrorMessage('');
      let session = null;
      const { access_token, refresh_token } = getTokensFromHash();
      console.log('[ResetPassword] Extracted access_token:', access_token);
      console.log('[ResetPassword] Extracted refresh_token:', refresh_token);
      if (access_token && refresh_token) {
        console.log('[ResetPassword] Calling supabase.auth.setSession...');
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        console.log('[ResetPassword] setSession result:', { data, error });
        if (error) {
          console.error('[ResetPassword] setSession error:', error);
          setErrorMessage('Invalid or expired reset link. Please request a new one.');
          setLoading(false);
          return;
        }
        session = data.session;
      } else {
        // No access token or refresh token in URL
        console.warn('[ResetPassword] Missing access token or refresh token in URL');
        setErrorMessage('Invalid or expired reset link. Please request a new one.');
        setLoading(false);
        return;
      }
      // Double check session
      if (!session) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('[ResetPassword] getSession result:', currentSession);
        if (!currentSession) {
          console.error('[ResetPassword] No session after setSession');
          setErrorMessage('Invalid or expired reset link. Please request a new one.');
          setLoading(false);
          return;
        }
      }
      setSessionReady(true);
      setLoading(false);
      console.log('[ResetPassword] Session is ready, showing form.');
    }
    handleSession();
  }, []);

  const handleResetPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!password || !confirmPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      console.error('[ResetPassword] updateUser error:', error);
      setErrorMessage('Failed to reset password. Please try again.');
      return;
    }
    setSuccessMessage('Password reset! Redirecting to login...');
    setTimeout(() => {
      router.replace('/login');
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LogoHeader />
        <Text style={styles.title}>Reset Password</Text>
        {loading && <ActivityIndicator size="large" color={Colors.accent} style={{ marginVertical: 16 }} />}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
        {!loading && sessionReady && !successMessage && !errorMessage && (
          <>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={Colors.muted}
            />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor={Colors.muted}
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
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
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  successText: {
    color: Colors.success,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
}); 