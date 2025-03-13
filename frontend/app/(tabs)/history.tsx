import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import supabase from '@/lib/supabase';
import Colors, { Spacing, BorderRadius, Shadows } from '@/constants/Colors';

interface Video {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration: number;
    created_at: string;
}

export default function HistoryScreen() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const loadVideos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/login');
                return;
            }

            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVideos(data || []);
        } catch (error) {
            console.error('Error loading videos:', error);
            Alert.alert('Error', 'Failed to load videos. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadVideos();
    };

    const handleVideoPress = (video: Video) => {
        // Navigate to video detail/playback screen
        router.push({
            pathname: '/video/[id]',
            params: { id: video.id }
        });
    };

    const handleDeleteVideo = async (videoId: string) => {
        Alert.alert(
            'Delete Video',
            'Are you sure you want to delete this video? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('videos')
                                .delete()
                                .eq('id', videoId);

                            if (error) throw error;
                            setVideos(videos.filter(v => v.id !== videoId));
                        } catch (error) {
                            console.error('Error deleting video:', error);
                            Alert.alert('Error', 'Failed to delete video. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString();
    };

    const renderVideoItem = ({ item }: { item: Video }) => (
        <TouchableOpacity 
            style={styles.videoCard}
            onPress={() => handleVideoPress(item)}
        >
            <View style={styles.thumbnailContainer}>
                {item.thumbnail_url ? (
                    <Image 
                        source={{ uri: item.thumbnail_url }}
                        style={styles.thumbnail}
                    />
                ) : (
                    <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                        <Ionicons name="videocam" size={32} color="#666" />
                    </View>
                )}
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
            </View>
            <View style={styles.videoInfo}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title || 'Untitled Video'}
                </Text>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            </View>
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteVideo(item.id)}
            >
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading videos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No videos yet</Text>
                        <TouchableOpacity 
                            style={styles.uploadButton}
                            onPress={() => router.push('/upload')}
                        >
                            <Text style={styles.uploadButtonText}>Upload a Video</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    listContent: {
        padding: Spacing.sm,
    },
    videoCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
        padding: Spacing.sm,
        ...Shadows.md,
    },
    thumbnailContainer: {
        position: 'relative',
        width: 120,
        height: 68,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    placeholderThumbnail: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    duration: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        fontSize: 12,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    videoInfo: {
        flex: 1,
        marginLeft: Spacing.sm,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#666',
    },
    deleteButton: {
        padding: Spacing.xs,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: Spacing.md,
    },
    uploadButton: {
        backgroundColor: Colors.primary.main,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
}); 