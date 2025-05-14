import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Colors from '@/constants/Colors';

interface StyledButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    secondary?: boolean;
    style?: any;
}

export default function StyledButton({
    title,
    onPress,
    disabled = false,
    isLoading = false,
    secondary = false,
    style = {},
}: StyledButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                secondary ? styles.secondaryButton : styles.primaryButton,
                disabled ? styles.buttonDisabled : {},
                style
            ]}
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
                <Text style={[
                    styles.buttonText,
                    secondary ? styles.secondaryButtonText : {}
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    primaryButton: {
        backgroundColor: Colors.accent,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.accent,
    },
    buttonDisabled: {
        backgroundColor: Colors.muted,
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: Colors.accent,
    }
}); 