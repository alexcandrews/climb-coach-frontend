import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { createVideoFormData } from '@/lib/api/videos';
import api from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function VideoUploadDetailsScreen() {
    const router = useRouter();
    const { videoUri } = useLocalSearchParams();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');
    const [aspectRatio, setAspectRatio] = useState(16 / 9);
    
    // Use dimensions to calculate a good size for the video
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const MAX_VIDEO_HEIGHT = windowHeight * 0.5; // e.g., max 50% of screen height
    const videoWidth = windowWidth - 48; // Account for container padding

    const handleUpload = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title for your video');
            return;
        }
        
        setUploading(true);
        setStatus('Uploading video...');
        
        try {
            // Create form data with the video file
            const formData = await createVideoFormData(videoUri as string);
            
            // Add title and location to the form data
            formData.append('title', title.trim());
            if (location.trim()) {
                formData.append('location', location.trim());
            }
            
            // Upload the video with metadata
            const response = await api.post('/api/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000 // 60 second timeout for large uploads
            });
            
            if (response.status !== 200 || !response.data.url) {
                throw new Error(response.data?.error || 'Upload failed');
            }
            
            setStatus('Upload successful!');
            Alert.alert('Success', 'Your video has been uploaded successfully!');
            
            // Navigate back to history tab
            router.replace('/(tabs)/history');
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
                        backgroundColor: 'transparent',
                    },
                    headerShadowVisible: false,
                    headerLeft: () => null, // Hide the back button
                    headerRight: () => (
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    ),
                }} 
            />
            
            <Text style={styles.header}>Preview & Upload</Text>
            {status ? <Text style={styles.statusText}>{status}</Text> : null}
            
            {/* Video container with dynamic aspect ratio */}
            <View style={styles.videoContainer}>
                <Video
                    source={{ uri: videoUri as string }}
                    style={{
                        width: videoWidth,
                        height: Math.min(videoWidth / aspectRatio, MAX_VIDEO_HEIGHT),
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
            
            <TextInput
                style={styles.input}
                placeholder="Title (required)"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Location (optional)"
                value={location}
                onChangeText={setLocation}
            />
            <Button
                title={uploading ? 'Uploading...' : 'Upload Video'}
                onPress={handleUpload}
                disabled={!title.trim() || uploading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 24, 
        backgroundColor: '#fff' 
    },
    header: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginBottom: 16,
        marginTop: 40, // Add some top margin to account for the header
    },
    statusText: {
        textAlign: 'center',
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
        marginBottom: 16,
    },
    videoContainer: {
        backgroundColor: '#000',
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    input: {
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 8,
        padding: 12, 
        marginBottom: 16, 
        fontSize: 16,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
});