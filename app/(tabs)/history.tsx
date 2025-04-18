import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors, { Spacing } from '@/constants/Colors';
import { API_CONFIG } from '../config';
import { useSession } from '@/lib/useSession';

interface VideoItem {
    id: string;
    name: string;
    url: string;
    createdAt: string;
    size?: number;
    contentType?: string;
}

export default function HistoryScreen() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { session, loading: sessionLoading } = useSession();

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!session?.access_token) {
                console.error('❌ No access token available');
                setError('Not authenticated. Please sign in.');
                setLoading(false);
                return;
            }
            
            console.log('📡 Fetching videos from:', `${API_CONFIG.BASE_URL}/api/videos`);
            console.log('🔑 Using access token:', session.access_token.substring(0, 10) + '...');
            
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/videos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🚫 API Error:', response.status, errorText);
                throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📦 Video data received:', JSON.stringify(data, null, 2));
            
            if (!data.videos) {
                console.warn('⚠️ No videos array in response:', data);
            }
            
            setVideos(data.videos || []);
        } catch (err) {
            console.error('❌ Error fetching videos:', err);
            setError(err instanceof Error ? err.message : 'Failed to load videos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchVideos();
        } else if (!sessionLoading) {
            setLoading(false);
            setError('Please sign in to view your videos');
        }
    }, [session, sessionLoading]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchVideos();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary.main} />
                    <Text style={styles.loadingText}>Loading your climbing videos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Climbing History</Text>
            </View>
            
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchVideos}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : videos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No videos found</Text>
                    <Text style={styles.subText}>Upload videos to see your climbing history</Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.videoItem}>
                            <Text style={styles.videoName}>{item.name}</Text>
                            <Text style={styles.videoDate}>
                                {item.createdAt ? formatDate(item.createdAt) : 'Unknown date'}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary.main]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.default,
    },
    header: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.secondary.dark,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 16,
        color: Colors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorText: {
        fontSize: 16,
        color: Colors.error,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    retryButton: {
        padding: Spacing.md,
        backgroundColor: Colors.primary.main,
        borderRadius: 8,
    },
    retryText: {
        color: Colors.primary.contrast,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    listContent: {
        padding: Spacing.md,
    },
    videoItem: {
        backgroundColor: Colors.background.paper,
        borderRadius: 8,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    videoName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },
    videoDate: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    subText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
}); 