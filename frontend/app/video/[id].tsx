import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import supabase from '@/lib/supabase';
import Timeline from '../components/Timeline';
import Colors, { Spacing, BorderRadius } from '@/constants/Colors';

interface VideoData {
    id: string;
    title: string;
    description: string;
    video_url: string;
    duration: number;
    coaching_insights: any[];
    created_at: string;
}

export default function VideoDetailScreen() {
    const { id } = useLocalSearchParams();
    const [video, setVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPosition, setCurrentPosition] = useState(0);
    const videoRef = useRef<Video>(null);
    const router = useRouter();

    useEffect(() => {
        loadVideo();
    }, [id]);

    const loadVideo = async () => {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) {
                Alert.alert('Error', 'Video not found');
                router.back();
                return;
            }

            setVideo(data);
        } catch (error) {
            console.error('Error loading video:', error);
            Alert.alert('Error', 'Failed to load video');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handlePositionChange = (position: number) => {
        setCurrentPosition(position);
    };

    const handleSeek = async (position: number) => {
        if (videoRef.current) {
            await videoRef.current.setPositionAsync(position * 1000);
            setCurrentPosition(position);
        }
    };

    if (loading || !video) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={{ uri: video.video_url }}
                        style={styles.video}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        onPlaybackStatusUpdate={status => {
                            if (!status.isLoaded) return;
                            setCurrentPosition(status.positionMillis / 1000);
                        }}
                    />
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.title}>{video.title || 'Untitled Video'}</Text>
                    {video.description && (
                        <Text style={styles.description}>{video.description}</Text>
                    )}
                    <Text style={styles.date}>
                        {new Date(video.created_at).toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.insightsContainer}>
                    <Text style={styles.sectionTitle}>Coaching Insights</Text>
                    <Timeline
                        uploading={false}
                        status=""
                        coachingInsights={video.coaching_insights || []}
                        videoDuration={video.duration}
                        currentPosition={currentPosition}
                        onSeek={handleSeek}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    videoContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
    },
    video: {
        flex: 1,
    },
    detailsContainer: {
        padding: Spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: Spacing.sm,
    },
    date: {
        fontSize: 14,
        color: '#999',
    },
    insightsContainer: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
}); 