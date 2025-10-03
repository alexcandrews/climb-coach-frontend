import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import supabase, { logoutUser } from '../../lib/supabase';

const debugLog = (...args: unknown[]) => {
    if (__DEV__) {
        console.log(...args);
    }
};

export default function AuthStatus() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuth();
        
        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session);
            debugLog('Auth state changed:', event, !!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
    };

    const handleLogout = async () => {
        await logoutUser();
        router.replace('/login');
    };

    if (isAuthenticated === null) {return null;}

    return (
        <View style={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 10,
            zIndex: 1000, // Ensure it stays on top
            elevation: 1000, // For Android
        }}>
            <View style={{ 
                padding: 5, 
                backgroundColor: isAuthenticated ? '#4CAF50' : '#f44336', 
                borderRadius: 5,
                zIndex: 1000,
                elevation: 1000,
            }}>
                <Text style={{ color: 'white', fontSize: 12 }}>
                    {isAuthenticated ? '🔒 Authenticated' : '🔓 Not Authenticated'}
                </Text>
            </View>
            {isAuthenticated && (
                <TouchableOpacity 
                    onPress={handleLogout}
                    style={{ 
                        padding: 5, 
                        backgroundColor: '#2196F3', 
                        borderRadius: 5,
                        zIndex: 1000,
                        elevation: 1000,
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 12 }}>🚪 Logout</Text>
                </TouchableOpacity>
            )}
        </View>
    );
} 
