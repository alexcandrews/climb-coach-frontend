import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, LayoutChangeEvent, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
    const cardHeights = useRef<{ [key: number]: number }>({});

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

    const handleCardLayout = (index: number) => (event: LayoutChangeEvent) => {
        const height = event.nativeEvent.layout.height;
        if (cardHeights.current[index] !== height) {
            cardHeights.current[index] = height;
        }
    };

    // Auto-scroll to active moment only when the active moment changes
    useEffect(() => {
        if (activeIndex >= 0 && scrollViewRef.current && lastScrolledIndex.current !== activeIndex) {
            lastScrolledIndex.current = activeIndex;
            
            // Calculate offset by summing heights of previous cards
            let offset = 0;
            for (let i = 0; i < activeIndex; i++) {
                offset += (cardHeights.current[i] || 0) + 12;
            }
            
            scrollViewRef.current.scrollTo({
                y: offset,
                animated: true
            });
        }
    }, [activeIndex]);

    return (
        <ScrollView 
            ref={scrollViewRef}
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
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
                    onLayout={handleCardLayout(index)}
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
        backgroundColor: 'transparent',
        ...(Platform.OS === 'web' ? {
            backgroundColor: 'rgba(245, 245, 245, 0)',
        } : {}),
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
        ...(Platform.OS === 'web' ? {
            backgroundColor: 'rgba(245, 245, 245, 0)',
        } : {}),
    },
    momentCard: {
        padding: 16,
        minHeight: 100,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        ...(Platform.OS === 'web' ? {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
        } : {}),
    },
    activeMomentCard: {
        borderColor: '#2196F3',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        ...(Platform.OS === 'web' ? {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
        } : {}),
    },
    momentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'transparent',
        ...(Platform.OS === 'web' ? {
            backgroundColor: 'rgba(245, 245, 245, 0)',
        } : {}),
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        ...(Platform.OS === 'web' ? {
            backgroundColor: 'rgba(245, 245, 245, 0)',
        } : {}),
    },
    timestamp: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
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
        color: '#000',
        lineHeight: 22,
        flexWrap: 'wrap',
    },
}); 