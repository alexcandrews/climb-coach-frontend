import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CoachingInsight } from '../types/coaching';

interface CoachingMomentsListProps {
    moments: CoachingInsight[];
    currentPosition: number;
}

export default function CoachingMomentsList({ 
    moments,
    currentPosition 
}: CoachingMomentsListProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const lastScrolledIndex = useRef<number>(-1);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Find the active coaching moment based on current video position
    const activeIndex = useMemo(() => {
        if (!moments.length) return -1;
        
        // Find the last moment that's before or at the current position
        for (let i = moments.length - 1; i >= 0; i--) {
            if (moments[i].timestamp <= currentPosition) {
                return i;
            }
        }
        return -1;
    }, [moments, currentPosition]);

    // Auto-scroll to active moment only when the active moment changes
    useEffect(() => {
        if (activeIndex >= 0 && scrollViewRef.current && lastScrolledIndex.current !== activeIndex) {
            lastScrolledIndex.current = activeIndex;
            scrollViewRef.current.scrollTo({
                y: activeIndex * (styles.momentCard.height + styles.momentCard.marginBottom),
                animated: true
            });
        }
    }, [activeIndex]);

    return (
        <ScrollView 
            ref={scrollViewRef}
            style={styles.container}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
        >
            {moments.map((moment, index) => (
                <View 
                    key={index} 
                    style={[
                        styles.momentCard,
                        index === activeIndex && styles.activeMomentCard
                    ]}
                >
                    <View style={styles.momentHeader}>
                        <Text style={styles.timestamp}>⏱️ {formatTime(moment.timestamp)}</Text>
                        <View style={styles.typeContainer}>
                            <Text style={styles.type}>{moment.type}</Text>
                            <Text style={styles.confidence}>{Math.round(moment.confidence * 100)}%</Text>
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
        marginTop: 20,
    },
    momentCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        height: 120, // Fixed height for consistent scrolling
    },
    activeMomentCard: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
        borderWidth: 1,
    },
    momentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timestamp: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    type: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2196F3',
        marginRight: 8,
    },
    confidence: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    coaching: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
}); 