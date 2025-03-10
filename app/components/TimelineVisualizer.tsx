import React from 'react';
import { View, Text, StyleSheet, PanResponder, GestureResponderEvent, Dimensions } from 'react-native';
import { CoachingInsight } from '../types/coaching';

interface TimelineVisualizerProps {
    moments: CoachingInsight[];
    videoDuration: number;
    currentPosition: number;
    onSeek?: (position: number) => void;
}

export default function TimelineVisualizer({ 
    moments, 
    videoDuration,
    currentPosition,
    onSeek 
}: TimelineVisualizerProps) {
    const screenWidth = Dimensions.get('window').width;
    const timelineWidth = screenWidth - 40; // 20px padding on each side

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: (evt: GestureResponderEvent) => {
                    handleScrub(evt);
                },
                onPanResponderMove: (evt: GestureResponderEvent) => {
                    handleScrub(evt);
                },
                onPanResponderRelease: () => {},
            }),
        [videoDuration]
    );

    const handleScrub = (evt: GestureResponderEvent) => {
        if (!videoDuration || !onSeek) return;

        const { locationX } = evt.nativeEvent;
        const position = (locationX / timelineWidth) * videoDuration;
        
        // Clamp position between 0 and video duration
        const clampedPosition = Math.max(0, Math.min(position, videoDuration));
        onSeek(clampedPosition);
    };

    if (!videoDuration) {
        return (
            <View style={styles.container}>
                <Text style={styles.waitingText}>Waiting for video duration...</Text>
            </View>
        );
    }

    const getPositionForTimestamp = (timestamp: number): number => {
        return (timestamp / videoDuration) * 100;
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.timelineContainer} {...panResponder.panHandlers}>
                <View style={[styles.timeline, { width: timelineWidth }]}>
                    {/* Progress bar */}
                    <View 
                        style={[
                            styles.progress, 
                            { width: `${(currentPosition / videoDuration) * 100}%` }
                        ]} 
                    />
                    
                    {/* Current position marker */}
                    <View 
                        style={[
                            styles.currentPositionMarker,
                            { left: `${(currentPosition / videoDuration) * 100}%` }
                        ]} 
                    />

                    {/* Coaching moment markers */}
                    {moments.map((moment, index) => (
                        <View
                            key={index}
                            style={[
                                styles.marker,
                                { left: `${getPositionForTimestamp(moment.timestamp)}%` }
                            ]}
                        >
                            <View style={styles.markerDot} />
                        </View>
                    ))}
                </View>

                {/* Time labels */}
                <View style={styles.timeLabels}>
                    <Text style={styles.timeLabel}>{formatTime(0)}</Text>
                    <Text style={styles.timeLabel}>{formatTime(videoDuration)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    waitingText: {
        textAlign: 'center',
        color: '#666',
    },
    timelineContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    timeline: {
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        position: 'relative',
    },
    progress: {
        position: 'absolute',
        height: '100%',
        backgroundColor: '#2196F3',
        borderRadius: 2,
    },
    currentPositionMarker: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: '#2196F3',
        borderRadius: 6,
        top: -4,
        marginLeft: -6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    marker: {
        position: 'absolute',
        alignItems: 'center',
        transform: [{ translateX: -6 }],
    },
    markerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFC107',
        borderWidth: 2,
        borderColor: '#fff',
        marginTop: -4,
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
    },
}); 