import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { API_CONFIG } from '../config';
import { useSession } from '@/lib/useSession';
import { APP_TEXT_STYLES } from '@/constants/Typography';
import LogoHeader from '@/components/LogoHeader';

interface VideoItem {
    id: string;
    name: string;
    url: string;
    createdAt: string;
    size?: number;
    contentType?: string;
    hasCoachingInsights?: boolean;
    coachingInsights?: any[];
    insightsCount?: number;
}

interface InsightData {
    videoId: string;
    coachingMoments: any[];
    count: number;
    status: string;
}

export default function HistoryScreen() {
    const router = useRouter();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { session, loading: sessionLoading } = useSession();
    
    // New state for insights
    const [selectedVideoInsights, setSelectedVideoInsights] = useState<InsightData | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsModalVisible, setInsightsModalVisible] = useState(false);

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
    
    // New function to fetch video insights
    const fetchVideoInsights = async (videoId: string) => {
        try {
            setInsightsLoading(true);
            
            if (!session?.access_token) {
                console.error('❌ No access token available');
                return;
            }
            
            console.log(`📡 Fetching insights for video ${videoId}`);
            
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/videos/${videoId}/insights`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch insights: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📊 Insights data received:', JSON.stringify(data, null, 2));
            
            setSelectedVideoInsights(data);
            setInsightsModalVisible(true);
        } catch (err) {
            console.error('❌ Error fetching insights:', err);
            alert('Failed to load insights: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setInsightsLoading(false);
        }
    };
    
    // Format timestamp for display
    const formatTimestamp = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                    <Text style={[APP_TEXT_STYLES.bodyText, styles.loadingText]}>Loading your climbing videos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LogoHeader marginBottom={20} />
            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={[APP_TEXT_STYLES.bodyText, styles.errorText]}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchVideos}>
                        <Text style={[APP_TEXT_STYLES.buttonText, styles.retryText]}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : videos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[APP_TEXT_STYLES.sectionTitle, styles.emptyText]}>No videos found</Text>
                    <Text style={[APP_TEXT_STYLES.bodyTextMuted, styles.subText]}>Upload videos to see your climbing history</Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.videoItem}
                            onPress={() => router.push(`/video/${item.id}`)}
                        >
                            <Text style={[APP_TEXT_STYLES.cardTitle, styles.videoName]}>{item.name}</Text>
                            <Text style={[APP_TEXT_STYLES.bodyTextMuted, styles.videoDate]}>
                                {item.createdAt ? formatDate(item.createdAt) : 'Unknown date'}
                            </Text>
                            {item.hasCoachingInsights && (
                                <View style={styles.insightsContainer}>
                                    <Text style={[APP_TEXT_STYLES.bodyText, styles.insightsText]}>
                                        {item.insightsCount} coaching {item.insightsCount === 1 ? 'insight' : 'insights'} available
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.viewInsightsButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            fetchVideoInsights(item.id);
                                        }}
                                        disabled={insightsLoading}
                                    >
                                        <Text style={[APP_TEXT_STYLES.buttonText, styles.viewInsightsText]}>
                                            {insightsLoading ? 'Loading...' : 'View Insights'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.accent]}
                        />
                    }
                />
            )}
            
            {/* Modal for displaying insights */}
            <Modal
                visible={insightsModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setInsightsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={[APP_TEXT_STYLES.sectionTitle, styles.modalTitle]}>Coaching Insights</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setInsightsModalVisible(false)}
                            >
                                <Text style={[APP_TEXT_STYLES.buttonText, styles.closeButtonText]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.insightsList}>
                            {selectedVideoInsights?.coachingMoments?.length ? (
                                selectedVideoInsights.coachingMoments.map((moment, index) => (
                                    <View key={index} style={styles.insightItem}>
                                        <View style={styles.insightHeader}>
                                            <Text style={[APP_TEXT_STYLES.labelText, styles.timestamp]}>
                                                ⏱️ {formatTimestamp(moment.timestamp)}
                                            </Text>
                                            <Text style={[APP_TEXT_STYLES.buttonText, styles.insightType]}>
                                                {moment.type || 'general'}
                                            </Text>
                                        </View>
                                        <Text style={[APP_TEXT_STYLES.bodyText, styles.insightText]}>
                                            {moment.coaching || moment.feedback}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={[APP_TEXT_STYLES.bodyTextMuted, styles.emptyText]}>
                                    {selectedVideoInsights?.status === 'no_insights' 
                                        ? 'No coaching insights available yet' 
                                        : 'Loading insights...'}
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        marginTop: Spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorText: {
        marginBottom: Spacing.md,
        textAlign: 'center',
        color: Colors.error,
    },
    retryButton: {
        padding: Spacing.md,
        backgroundColor: Colors.accent,
        borderRadius: 8,
    },
    retryText: {
        // Button text is already styled by APP_TEXT_STYLES
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        marginBottom: Spacing.md,
    },
    listContent: {
        padding: Spacing.md,
    },
    videoItem: {
        backgroundColor: Colors.dark.card,
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
        marginBottom: Spacing.sm,
    },
    videoDate: {
        // Style handled by APP_TEXT_STYLES.bodyTextMuted
    },
    subText: {
        textAlign: 'center',
    },
    // Keep the rest of the styles with positioning/layout only
    // ...
}); 