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
        padding: 10,
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    timelineContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
    },
    messageText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    statusText: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
    },
}); 