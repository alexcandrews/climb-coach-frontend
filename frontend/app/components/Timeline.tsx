import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import TimelineVisualizer from './TimelineVisualizer';
import CoachingMomentsList from './CoachingMomentsList';
import { CoachingInsight } from '../types/coaching';

interface TimelineProps {
    uploading: boolean;
    status: string;
    coachingInsights: CoachingInsight[];
    videoDuration: number;
    currentPosition?: number;
    onSeek?: (position: number) => void;
}

export default function Timeline({ 
    uploading, 
    status, 
    coachingInsights, 
    videoDuration,
    currentPosition = 0,
    onSeek 
}: TimelineProps) {
    return (
        <View style={styles.container}>
            {uploading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            ) : coachingInsights.length === 0 ? (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>
                        {status || "No coaching insights available"}
                    </Text>
                </View>
            ) : (
                <View style={styles.timelineContainer}>
                    <TimelineVisualizer 
                        moments={coachingInsights}
                        videoDuration={videoDuration}
                        currentPosition={currentPosition}
                        onSeek={onSeek}
                    />
                    <Text style={styles.statusText}>{status}</Text>
                    <CoachingMomentsList 
                        moments={coachingInsights}
                        currentPosition={currentPosition}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    timelineContainer: {
        flex: 1,
    },
    statusText: {
        textAlign: 'center',
        marginVertical: 10,
        color: '#666',
    },
    messageText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
    },
}); 