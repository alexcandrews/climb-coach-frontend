import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import supabase from '../../lib/supabase';
import { resetApiClient } from '../../lib/api/client';

const debugLog = (...args: unknown[]) => {
    if (__DEV__) {
        console.log(...args);
    }
};

// List of paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/signup', 'login', 'signup', 'index', '/', '/index', '/(tabs)'];

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Check if current path is a public path
    const isPublicPath = PUBLIC_PATHS.some(path => 
        pathname.includes(path) || pathname === path
    );

    // Debug logging
    debugLog('Current pathname:', pathname);
    debugLog('Is public path?', isPublicPath);

    useEffect(() => {
        if (isPublicPath) {
            setIsLoading(false);
            return;
        }

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            debugLog('Auth state changed:', event, !!session);
            setIsAuthenticated(!!session);

            // Reset API client on auth state changes to ensure fresh token
            if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                debugLog('Resetting API client due to auth event:', event);
                resetApiClient();
            }

            if (!session && !isLoading && !isPublicPath) {
                router.replace('/login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [pathname, isPublicPath]);

    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            debugLog('Session check:', !!session);
            setIsAuthenticated(!!session);
            if (!session && !isPublicPath) {
                router.replace('/login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            if (!isPublicPath) {
                router.replace('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Debug logging for render conditions
    debugLog('Render conditions:', {
        isLoading,
        isPublicPath,
        isAuthenticated,
        pathname
    });

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // Always render children for public paths
    if (isPublicPath) {
        return <>{children}</>;
    }

    // For protected paths, only render if authenticated
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
} 
