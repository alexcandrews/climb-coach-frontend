import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { API_CONFIG } from '../config';
import { useSession } from '../../lib/useSession';
import { APP_TEXT_STYLES } from '../../constants/Typography';
import LogoHeader from '../../components/LogoHeader';
import { Ionicons } from '@expo/vector-icons';

interface VideoItem {
    id: string;
    title: string;
    url: string;
    createdAt: string;
    size?: number;
    contentType?: string;
    hasCoachingInsights?: boolean;
    coachingInsights?: any[];
    insightsCount?: number;
    thumbnail?: string;
    thumbnailUrl?: string;
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
    
    // State for insights
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
            
            // Log each video to check if 'name' field exists
            if (data.videos && data.videos.length > 0) {
                console.log('📹 First video details:', data.videos[0]);
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

    useEffect(() => {
        if (videos.length > 0) {
            console.log('First video structure:', videos[0]);
        }
    }, [videos]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchVideos();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric'
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
            
            <View style={styles.content}>
                {/* LogoHeader with consistent spacing */}
                <LogoHeader marginBottom={30} />
                
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
                        renderItem={({ item }) => {
                            return (
                                <TouchableOpacity 
                                    style={styles.videoItem}
                                    onPress={() => router.push(`/video/${item.id}`)}
                                >
                                    <View style={styles.thumbnailContainer}>
                                        <View style={styles.thumbnail}>
                                            {item.thumbnailUrl ? (
                                                <Image 
                                                    source={{ uri: item.thumbnailUrl }} 
                                                    style={styles.thumbnailImage} 
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={styles.placeholderThumbnail}>
                                                    <Ionicons name="film-outline" size={30} color="#555" />
                                                </View>
                                            )}
                                            <TouchableOpacity 
                                                style={styles.playButton}
                                                onPress={() => router.push(`/video/${item.id}`)}
                                            >
                                                <Ionicons name="play" size={24} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={styles.videoInfo}>
                                        {item.title ? (
                                            <Text style={styles.videoName}>{item.title}</Text>
                                        ) : (
                                            <Text style={styles.videoName}>Untitled Climb</Text>
                                        )}
                                        <Text style={styles.videoDate}>
                                            {item.createdAt ? formatDate(item.createdAt) : 'Unknown date'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[Colors.accent]}
                                tintColor={Colors.accent}
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
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        justifyContent: "flex-start",
        paddingTop: 30,
        alignItems: "center",
        width: '100%',
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
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    videoItem: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        marginBottom: 30,
        alignItems: 'center',
    },
    thumbnailContainer: {
        width: 130,
        height: 80,
        marginRight: Spacing.md,
        borderRadius: 8,
        overflow: 'hidden'
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2A3440',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden'
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2A3440',
    },
    placeholderThumbnail: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2A3440',
    },
    playButton: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    videoInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    videoName: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 6,
    },
    videoDate: {
        fontSize: 18,
        color: 'rgba(160, 168, 163, 0.8)',
    },
    insightsButton: {
        alignSelf: 'flex-start',
        marginTop: Spacing.sm,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        backgroundColor: Colors.accent,
        borderRadius: 4,
    },
    insightsButtonText: {
        color: Colors.text,
        fontWeight: '600',
    },
    subText: {
        textAlign: 'center',
    },
    insightsContainer: {
        marginTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: Spacing.sm,
    },
    insightsText: {
        marginBottom: Spacing.xs,
    },
    viewInsightsButton: {
        backgroundColor: Colors.accent,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: Spacing.xs,
    },
    viewInsightsText: {
        color: Colors.text,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.md,
    },
    modalContent: {
        backgroundColor: Colors.dark.card,
        borderRadius: 12,
        width: '100%',
        maxHeight: '80%',
        padding: Spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: Spacing.sm,
    },
    modalTitle: {
        // Style handled by APP_TEXT_STYLES.sectionTitle
    },
    closeButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: 6,
    },
    closeButtonText: {
        // Style handled by APP_TEXT_STYLES.buttonText
    },
    insightsList: {
        flex: 1,
    },
    insightItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    timestamp: {
        // Style handled by APP_TEXT_STYLES.labelText
    },
    insightType: {
        backgroundColor: Colors.accent,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    insightText: {
        // Style handled by APP_TEXT_STYLES.bodyText
    },
}); 