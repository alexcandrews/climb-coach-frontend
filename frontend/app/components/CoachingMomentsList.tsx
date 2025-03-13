import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CoachingInsight } from '../types/coaching';
import Colors from '@/constants/Colors';

interface CoachingMomentsListProps {
    moments: CoachingInsight[];
    currentPosition: number;
}

export default function CoachingMomentsList({
    moments,
    currentPosition
}: CoachingMomentsListProps) {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTypeColor = (type: string): string => {
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

    return (
        <ScrollView style={styles.container}>
            {moments.map((moment, index) => (
                <View 
                    key={index}
                    style={[
                        styles.momentCard,
                        currentPosition >= moment.timestamp && styles.momentPassed
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={styles.timestamp}>
                            {formatTime(moment.timestamp)}
                        </Text>
                        <View 
                            style={[
                                styles.typeTag,
                                { backgroundColor: getTypeColor(moment.type) }
                            ]}
                        >
                            <Text style={styles.typeText}>{moment.type}</Text>
                        </View>
                    </View>
                    <Text style={styles.coaching}>{moment.coaching}</Text>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
    },
    momentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    momentPassed: {
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 14,
        color: '#666',
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    coaching: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
}); 