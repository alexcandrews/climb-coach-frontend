import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { uploadVideoDirectToSupabase /* , updateVideoMetadata */ } from '@/lib/api/videos';
import api from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import StyledButton from '@/components/StyledButton';
import LogoHeader from '@/components/LogoHeader';
import Spacing from '@/constants/Spacing';
import BorderRadius from '@/constants/BorderRadius';
import Shadows from '@/constants/Shadows';
import * as Progress from 'react-native-progress';

export default function VideoUploadDetailsScreen() {
    const router = useRouter();
    const { videoUri } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');
    const [aspectRatio, setAspectRatio] = useState(16 / 9);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // Use dimensions to calculate a good size for the video
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const MAX_VIDEO_HEIGHT = windowHeight * 0.4; // Reduced to make room for tab bar
    const videoWidth = windowWidth - 48; // Account for container padding

    const handleUpload = async () => {
        if (!title.trim()) {
            Alert.alert('Title Required', 'Please enter a title for your video.');
            return;
        }

        try {
            setUploading(true);
            setStatus('Preparing upload...');
            
            if (videoUri) {
                // Use direct Supabase upload for better performance and reliability
                const result = await uploadVideoDirectToSupabase(videoUri as string, (progress) => {
                    setUploadProgress(progress);
                    
                    // Set status message based on progress
                    if (progress < 90) {
                        setStatus(`Uploading video: ${progress}%`);
                    } else if (progress < 100) {
                        setStatus('Finalizing upload...');
                    } else {
                        setStatus('Upload complete!');
                    }
                });
                
                // Handle different result scenarios
                if (result.error) {
                    throw new Error(result.error);
                }
                
                // Update metadata if we have an ID
                /*
                if (result.id) {
                    try {
                        await updateVideoMetadata(result.id, {
                            title: title.trim(),
                            location: location.trim() || undefined
                        });
                    } catch (metadataError) {
                        console.warn('Failed to update video metadata, but upload was successful:', metadataError);
                    }
                }
                */
                
                setStatus('Upload successful!');
                
                // Navigate immediately and show toast/alert after navigation
                router.replace('/(tabs)/history');
                
                // Short delay before showing alert to ensure navigation has started
                setTimeout(() => {
                    // Show success message after navigation starts
                    Alert.alert(
                        'Upload Successful', 
                        'Your video has been uploaded and is being analyzed in the background. You can view it in your video history.'
                    );
                }, 100);
            } else {
                throw new Error('No video selected');
            }
        } catch (error) {
            setStatus('');
            console.error('Upload failed:', error);
            Alert.alert(
                'Upload Failed', 
                error instanceof Error ? error.message : 'An unexpected error occurred'
            );
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        // Go back to the upload tab
        router.replace('/(tabs)/upload');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{
                    headerShown: true,
                    headerTitle: '', 
                    headerStyle: {
                        backgroundColor: Colors.background,
                    },
                    headerShadowVisible: false,
                    headerLeft: () => null, // Hide the back button
                    headerRight: () => (
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={Colors.text} />
                        </TouchableOpacity>
                    ),
                }} 
            />
            
            <SafeAreaView style={styles.wrapper}>
                <View style={styles.content}>
                    <LogoHeader marginBottom={20} />
                    <Text style={styles.header}>Preview & Upload</Text>
                    
                    {/* Status and progress */}
                    {status ? <Text style={styles.statusText}>{status}</Text> : null}
                    {uploading && (
                        <View style={styles.progressContainer}>
                            <Progress.Bar 
                                progress={uploadProgress / 100}
                                width={null}
                                color={Colors.accent}
                                unfilledColor="rgba(255,255,255,0.1)"
                                borderWidth={0}
                                style={styles.progressBar}
                            />
                        </View>
                    )}
                    
                    {/* Video container with dynamic aspect ratio */}
                    <View style={styles.videoContainer}>
                        <Video
                            source={{ uri: videoUri as string }}
                            style={{
                                width: '100%',
                                height: undefined,
                                aspectRatio: aspectRatio,
                                maxHeight: MAX_VIDEO_HEIGHT,
                            }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                            isMuted
                            isLooping
                            onLoad={(status) => {
                                if (status.isLoaded) {
                                    // Type assertion for naturalSize property
                                    const statusWithSize = status as any;
                                    if (statusWithSize.naturalSize) {
                                        const { width, height } = statusWithSize.naturalSize;
                                        if (width && height) {
                                            setAspectRatio(width / height);
                                        }
                                    }
                                }
                            }}
                        />
                    </View>
                    
                    <View style={styles.formSection}>
                        <TextInput
                            style={styles.input}
                            placeholder="Title (required)"
                            placeholderTextColor={Colors.muted}
                            value={title}
                            onChangeText={setTitle}
                            selectionColor={Colors.accent}
                            editable={!uploading}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Location (optional)"
                            placeholderTextColor={Colors.muted}
                            value={location}
                            onChangeText={setLocation}
                            selectionColor={Colors.accent}
                            editable={!uploading}
                        />
                        <StyledButton
                            title={uploading ? 'Uploading...' : 'Upload Video'}
                            onPress={handleUpload}
                            disabled={!title.trim() || uploading}
                            isLoading={uploading}
                            style={styles.uploadButton}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.background 
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
    },
    content: {
        flex: 1,
        width: '100%',
        maxWidth: 500, // Maximum width to prevent stretching on tablets/web
        paddingHorizontal: Spacing.md, // Consistent padding from constants
        paddingBottom: 80, // Add bottom padding to account for tab bar
        paddingTop: 0, // Reduce top padding since we have the logo
    },
    header: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: Spacing.md,
        color: Colors.text,
        textAlign: 'center',
    },
    statusText: {
        textAlign: 'center',
        padding: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xs,
        color: Colors.text,
    },
    progressContainer: {
        marginBottom: Spacing.md,
        width: '100%',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        width: '100%',
    },
    videoContainer: {
        backgroundColor: '#000',
        marginBottom: Spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    formSection: {
        width: '100%',
    },
    input: {
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.2)', 
        borderRadius: BorderRadius.md,
        padding: Spacing.md, 
        marginBottom: Spacing.md, 
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: Colors.text,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        ...Shadows.sm,
    },
    uploadButton: {
        marginTop: Spacing.sm,
    }
});