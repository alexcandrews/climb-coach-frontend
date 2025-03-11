import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableWithoutFeedback, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 49; // Standard tab bar height

interface VideoPlayerProps {
    videoUri: string | null;
    videoRef: React.RefObject<Video>;
    onSelectVideo: () => void;
    onLoadComplete?: (duration: number) => void;
    onPositionChange?: (position: number) => void;
    seekTo?: number;
}

export default function VideoPlayer({ 
    videoUri, 
    videoRef, 
    onSelectVideo, 
    onLoadComplete,
    onPositionChange,
    seekTo 
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const lastReportedPosition = useRef(0);
    const webVideoElement = useRef<HTMLVideoElement | null>(null);

    // Cleanup web video event listeners
    useEffect(() => {
        return () => {
            if (webVideoElement.current) {
                webVideoElement.current.removeEventListener('timeupdate', handleWebTimeUpdate);
            }
        };
    }, []);

    // Handle external seek requests
    useEffect(() => {
        if (seekTo !== undefined && videoRef.current && !isSeeking) {
            setIsSeeking(true);
            videoRef.current.setPositionAsync(seekTo * 1000).then(() => {
                setIsSeeking(false);
            });
        }
    }, [seekTo]);

    const handlePlayPause = async () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    const shouldUpdatePosition = useCallback((newPosition: number) => {
        // Only update if position has changed by more than 0.5 seconds
        const shouldUpdate = Math.abs(newPosition - lastReportedPosition.current) > 0.5;
        if (shouldUpdate) {
            lastReportedPosition.current = newPosition;
        }
        return shouldUpdate;
    }, []);

    const handleWebTimeUpdate = useCallback(() => {
        if (!isSeeking && onPositionChange && webVideoElement.current) {
            const currentPosition = webVideoElement.current.currentTime;
            if (shouldUpdatePosition(currentPosition)) {
                onPositionChange(currentPosition);
            }
        }
    }, [isSeeking, onPositionChange, shouldUpdatePosition]);

    const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        
        if (status.didJustFinish) {
            setIsPlaying(false);
            return;
        }

        if (!isSeeking && onPositionChange && status.positionMillis) {
            const currentPosition = status.positionMillis / 1000;
            if (shouldUpdatePosition(currentPosition)) {
                onPositionChange(currentPosition);
            }
        }
    }, [isSeeking, onPositionChange, shouldUpdatePosition]);

    const handleLoad = (status: AVPlaybackStatus | any) => {
        if (Platform.OS === 'web') {
            const videoElement = status.target as HTMLVideoElement;
            if (videoElement && !isNaN(videoElement.duration)) {
                webVideoElement.current = videoElement;
                onLoadComplete?.(videoElement.duration);
                videoElement.addEventListener('timeupdate', handleWebTimeUpdate);
            }
        } else {
            if (!status.isLoaded) return;
            const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
            onLoadComplete?.(duration);
        }
    };

    return (
        <View style={styles.container}>
            {videoUri ? (
                <TouchableWithoutFeedback onPress={handlePlayPause}>
                    <View style={styles.videoContainer}>
                        <Video
                            ref={videoRef}
                            style={styles.video}
                            source={typeof videoUri === 'string' ? { uri: videoUri } : videoUri}
                            resizeMode={ResizeMode.COVER}
                            isLooping={false}
                            isMuted={true}
                            shouldPlay={false}
                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                            onLoad={handleLoad}
                            progressUpdateIntervalMillis={500}
                        />
                        {!isPlaying && (
                            <View style={styles.playOverlay}>
                                <Text style={styles.playIcon}>▶️</Text>
                            </View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            ) : (
                <View style={[styles.uploadPrompt, styles.center]}>
                    <Ionicons name="cloud-upload-outline" size={48} color="#666" />
                    <Text style={styles.uploadPromptText}>Tap + to Upload Video</Text>
                </View>
            )}
            
            <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={onSelectVideo}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: TAB_BAR_HEIGHT,
        backgroundColor: '#000',
    },
    videoContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    uploadPrompt: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadPromptText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        fontSize: 64,
    },
    uploadButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        right: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
}); 