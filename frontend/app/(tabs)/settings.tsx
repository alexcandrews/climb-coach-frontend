import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import supabase, { logoutUser } from '@/lib/supabase';
import Colors, { Spacing, BorderRadius, Shadows } from '@/constants/Colors';

export default function SettingsScreen() {
    const router = useRouter();
    const [email, setEmail] = useState<string | undefined>();

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setEmail(user?.email);
        };
        loadUser();
    }, []);

    const handleSignOut = async () => {
        await logoutUser();
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{email}</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.logoutButton} 
                    onPress={handleSignOut}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.default,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    section: {
        backgroundColor: Colors.background.paper,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadows.sm,
    },
    label: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
    value: {
        fontSize: 16,
        color: Colors.text.primary,
    },
    logoutButton: {
        backgroundColor: Colors.error,
        padding: Spacing.md,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        ...Shadows.sm,
    },
    logoutText: {
        color: Colors.primary.contrast,
        fontSize: 16,
        fontWeight: '500',
    },
}); 