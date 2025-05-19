import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Dimensions, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { uploadVideoDirectToSupabase /* , updateVideoMetadata */ } from '@/lib/api/videos';
import api from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import StyledButton from '@/components/StyledButton';
import Spacing from '@/constants/Spacing';
import BorderRadius from '@/constants/BorderRadius';
import Shadows from '@/constants/Shadows';
import * as Progress from 'react-native-progress';
import VideoPlayer from '../components/VideoPlayer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const videoStyles = Platform.OS === 'web' ? 
  `
    #climb-coach-upload-video-container,
    #climb-coach-upload-video-container * {
      transform: rotate(0deg) !important;
    }
    #climb-coach-upload-video-player {
      transform: rotate(0deg) !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
    }
    #climb-coach-upload-video-player:-webkit-full-screen {
      transform: rotate(0deg) !important;
    }
    #climb-coach-upload-video-player::-webkit-media-controls {
      transform: rotate(0deg) !important;
    }
    #climb-coach-upload-video-player::-webkit-media-controls-timeline {
      transform: rotate(0deg) !important;
    }
  ` : '';

export default function VideoUploadDetailsScreen() {
    const router = useRouter();
    const { videoUri } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const videoRef = useRef<Video>(null);
    const videoContainerRef = useRef(null);

    // Inject CSS for web video player
    useEffect(() => {
      if (Platform.OS === 'web') {
        const styleElement = document.createElement('style');
        styleElement.textContent = videoStyles;
        document.head.appendChild(styleElement);
        return () => {
          document.head.removeChild(styleElement);
        };
      }
    }, []);

    // Inject video element for web
    useEffect(() => {
      if (Platform.OS === 'web' && videoContainerRef.current && videoUri) {
        const container = videoContainerRef.current as HTMLDivElement;
        container.innerHTML = '';
        const videoElement = document.createElement('video');
        videoElement.id = 'climb-coach-upload-video-player';
        videoElement.src = videoUri as string;
        videoElement.controls = true;
        videoElement.playsInline = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'contain';
        videoElement.style.transform = 'rotate(0deg)';
        container.appendChild(videoElement);
      }
    }, [videoUri, videoContainerRef.current]);

    const handleSelectVideo = () => {};

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
                const result = await uploadVideoDirectToSupabase({
                    videoUri: videoUri as string,
                    title: title.trim(),
                    location: location.trim() || undefined,
                    onProgress: (progress) => {
                        setUploadProgress(progress);
                        
                        // Set status message based on progress
                        if (progress < 90) {
                            setStatus(`Uploading video: ${progress}%`);
                        } else if (progress < 100) {
                            setStatus('Finalizing upload...');
                        } else {
                            setStatus('Upload complete!');
                        }
                    }
                });
                
                // Handle different result scenarios
                if (result.error) {
                    throw new Error(result.error);
                }
                
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
        router.replace('/(tabs)/upload');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen 
                options={{
                    headerShown: false,
                }} 
            />
            {/* Floating close button */}
            <View style={styles.floatingCloseButtonContainer} pointerEvents="box-none">
                <SafeAreaView style={styles.floatingCloseButtonSafeArea} pointerEvents="box-none">
                    <View style={styles.floatingCloseButtonWrapper} pointerEvents="box-none">
                        <TouchableOpacity
                            style={styles.floatingCloseButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
            {/* Video player at the top */}
            <View style={styles.videoContainer}>
                {Platform.OS === 'web' ? (
                  <div
                    id="climb-coach-upload-video-container"
                    ref={videoContainerRef}
                    style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                  />
                ) : (
                  videoUri && (
                    <Video
                      ref={videoRef}
                      style={styles.nativeVideo}
                      source={{ uri: videoUri as string }}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls
                      isLooping={false}
                      shouldPlay={false}
                    />
                  )
                )}
            </View>

            <SafeAreaView style={styles.wrapper}>
                <View style={styles.content}>
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
    videoContainer: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.6,
        backgroundColor: '#000',
    },
    nativeVideo: {
        width: '100%',
        height: '100%',
    },
    wrapper: {
        flex: 1,
        alignItems: 'center',
    },
    content: {
        flex: 1,
        width: '100%',
        maxWidth: 500,
        paddingHorizontal: Spacing.md,
        paddingBottom: 80,
        paddingTop: Spacing.lg,
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
    },
    floatingCloseButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        pointerEvents: 'box-none',
    },
    floatingCloseButtonSafeArea: {
        alignItems: 'flex-end',
        pointerEvents: 'box-none',
    },
    floatingCloseButtonWrapper: {
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingRight: 16,
        pointerEvents: 'box-none',
    },
    floatingCloseButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});