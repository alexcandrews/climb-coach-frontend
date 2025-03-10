import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

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
        <View style={styles.videoSection}>
            {videoUri ? (
                <TouchableWithoutFeedback onPress={handlePlayPause}>
                    <View style={styles.videoContainer}>
                        <Video
                            ref={videoRef}
                            style={styles.video}
                            source={typeof videoUri === 'string' ? { uri: videoUri } : videoUri}
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping={false}
                            isMuted={true}
                            shouldPlay={false}
                            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                            onLoad={handleLoad}
                            progressUpdateIntervalMillis={500} // Further reduced update frequency
                        />
                        {!isPlaying && (
                            <View style={styles.playOverlay}>
                                <Text style={styles.playIcon}>▶️</Text>
                            </View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            ) : (
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>
                        No video selected
                    </Text>
                    <Button title="Select Video" onPress={onSelectVideo} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    videoSection: {
        flex: 2,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        fontSize: 50,
        opacity: 0.9,
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    placeholderText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
}); 