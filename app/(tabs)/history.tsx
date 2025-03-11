import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors, { Spacing } from '@/constants/Colors';

export default function HistoryScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
                <Text style={styles.subText}>Track your climbing progress over time</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.default,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    comingSoonText: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    subText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
}); 