import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CoachingInsight } from '../types/coaching';
import Colors from '@/constants/Colors';

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
    const timelineWidth = screenWidth - 32; // 16px padding on each side

    const handleTimelinePress = (event: any) => {
        if (!videoDuration || !onSeek) return;

        const { locationX } = event.nativeEvent;
        const position = (locationX / timelineWidth) * videoDuration;
        onSeek(Math.max(0, Math.min(position, videoDuration)));
    };

    const getPositionStyle = (timestamp: number) => {
        const position = (timestamp / videoDuration) * timelineWidth;
        return {
            left: position,
        };
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentPositionStyle = {
        left: (currentPosition / videoDuration) * timelineWidth,
    };

    if (!videoDuration) {
        return (
            <View style={styles.container}>
                <Text style={styles.waitingText}>Loading video duration...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.timeline}
                onPress={handleTimelinePress}
            >
                <View style={styles.timelineBar} />
                {moments.map((moment, index) => (
                    <View
                        key={index}
                        style={[styles.marker, getPositionStyle(moment.timestamp)]}
                    >
                        <View 
                            style={[
                                styles.markerDot,
                                { backgroundColor: getMarkerColor(moment.type) }
                            ]} 
                        />
                    </View>
                ))}
                <View style={[styles.playhead, currentPositionStyle]} />
            </TouchableOpacity>
            <View style={styles.timeLabels}>
                <Text style={styles.timeLabel}>0:00</Text>
                <Text style={styles.timeLabel}>{formatTime(videoDuration)}</Text>
            </View>
        </View>
    );
}

const getMarkerColor = (type: string): string => {
    switch (type.toLowerCase()) {
        case 'movement efficiency':
            return Colors.success;
        case 'balance improvement':
            return Colors.primary.main;
        case 'strength correction':
            return Colors.error;
        default:
            return Colors.primary.main;
    }
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    timeline: {
        height: 40,
        justifyContent: 'center',
        position: 'relative',
    },
    timelineBar: {
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
    },
    marker: {
        position: 'absolute',
        transform: [{ translateX: -6 }], // Center the marker
    },
    markerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary.main,
    },
    playhead: {
        position: 'absolute',
        width: 3,
        height: 20,
        backgroundColor: Colors.primary.main,
        transform: [{ translateX: -1.5 }], // Center the playhead
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    timeLabel: {
        fontSize: 12,
        color: '#666',
    },
    waitingText: {
        textAlign: 'center',
        color: '#666',
        marginVertical: 10,
    },
}); 