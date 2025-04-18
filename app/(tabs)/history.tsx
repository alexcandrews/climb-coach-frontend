import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, ScrollView } from 'react-native';
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
                            {item.hasCoachingInsights && (
                                <View style={styles.insightsContainer}>
                                    <Text style={styles.insightsText}>
                                        {item.insightsCount} coaching {item.insightsCount === 1 ? 'insight' : 'insights'} available
                                    </Text>
                                    <TouchableOpacity 
                                        style={styles.viewInsightsButton}
                                        onPress={() => fetchVideoInsights(item.id)}
                                        disabled={insightsLoading}
                                    >
                                        <Text style={styles.viewInsightsText}>
                                            {insightsLoading ? 'Loading...' : 'View Insights'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
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
                            <Text style={styles.modalTitle}>Coaching Insights</Text>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setInsightsModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.insightsList}>
                            {selectedVideoInsights?.coachingMoments?.length ? (
                                selectedVideoInsights.coachingMoments.map((moment, index) => (
                                    <View key={index} style={styles.insightItem}>
                                        <View style={styles.insightHeader}>
                                            <Text style={styles.timestamp}>
                                                ⏱️ {formatTimestamp(moment.timestamp)}
                                            </Text>
                                            <Text style={styles.insightType}>
                                                {moment.type || 'general'}
                                            </Text>
                                        </View>
                                        <Text style={styles.insightText}>
                                            {moment.coaching || moment.feedback}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>
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
    insightsContainer: {
        marginTop: Spacing.md,
        padding: Spacing.sm,
        backgroundColor: Colors.background.default,
        borderRadius: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    insightsText: {
        fontSize: 14,
        color: Colors.primary.main,
        fontWeight: '500',
    },
    viewInsightsButton: {
        backgroundColor: Colors.primary.main,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: 4,
    },
    viewInsightsText: {
        color: Colors.primary.contrast,
        fontSize: 12,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.background.paper,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
        padding: Spacing.md,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.secondary.main,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    closeButton: {
        padding: Spacing.xs,
    },
    closeButtonText: {
        color: Colors.primary.main,
        fontSize: 16,
        fontWeight: '500',
    },
    insightsList: {
        flex: 1,
    },
    insightItem: {
        backgroundColor: Colors.background.default,
        borderRadius: 8,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    timestamp: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.primary.main,
    },
    insightType: {
        fontSize: 12,
        color: Colors.primary.dark,
        backgroundColor: Colors.primary.light,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
        textTransform: 'capitalize',
    },
    insightText: {
        fontSize: 14,
        color: Colors.text.primary,
        lineHeight: 20,
    },
}); 