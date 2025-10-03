import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Dimensions, SafeAreaView, Platform, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
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
import * as VideoThumbnails from 'expo-video-thumbnails';

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
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [showVideo, setShowVideo] = useState(false);
    const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
    const objectUrlRef = useRef<string | null>(null);
    
    const videoRef = useRef<Video>(null);
    const videoContainerRef = useRef(null);

    // Inject CSS for web video player
    useEffect(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        try {
          const styleElement = document.createElement('style');
          styleElement.textContent = videoStyles;
          document.head.appendChild(styleElement);
          return () => {
            try {
              document.head.removeChild(styleElement);
            } catch (err) {
              console.warn('Failed to remove style element:', err);
            }
          };
        } catch (err) {
          console.error('Failed to inject video styles:', err);
        }
      }
    }, []);

    // Inject video element for web
    useEffect(() => {
      if (Platform.OS === 'web' && typeof document !== 'undefined' && videoContainerRef.current && videoUri) {
        try {
          const container = videoContainerRef.current as HTMLDivElement;
          if (!container) {
            console.warn('Video container ref is not available');
            return;
          }
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
        } catch (err) {
          console.error('Failed to create video element:', err);
        }
      }
    }, [videoUri, videoContainerRef.current]);

    // Improved thumbnail generation effect
    useEffect(() => {
      if (!videoUri) return;
      let uri: string = Array.isArray(videoUri) ? videoUri[0] : videoUri;
      setGeneratingThumbnail(true);
      setThumbnail(null);
      // Clean up previous object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      if (Platform.OS === 'web' && typeof document !== 'undefined' && typeof URL !== 'undefined') {
        // If uri is a data URL, convert to blob and then to object URL
        if (uri.startsWith('data:')) {
          fetch(uri)
            .then(res => res.blob())
            .then(blob => {
              const objectUrl = URL.createObjectURL(blob);
              objectUrlRef.current = objectUrl;
              generateWebThumbnail(objectUrl);
            })
            .catch(err => {
              console.error('Failed to convert data URL to blob:', err);
              setGeneratingThumbnail(false);
            });
        } else {
          objectUrlRef.current = uri;
          generateWebThumbnail(uri);
        }
        function generateWebThumbnail(url: string) {
          try {
            const video = document.createElement('video');
            video.src = url;
            video.crossOrigin = 'anonymous';
            video.muted = true;
            video.playsInline = true;
            video.currentTime = 0.1; // Seek to 0.1s to avoid black frame
            let seeked = false;
            video.addEventListener('loadeddata', () => {
              // Wait for enough data to be loaded
              video.currentTime = 0.1;
            });
            video.addEventListener('seeked', () => {
              if (seeked) return; // Prevent double-calling
              seeked = true;
              try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  console.error('Failed to get canvas 2d context');
                  setGeneratingThumbnail(false);
                  return;
                }
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setThumbnail(canvas.toDataURL('image/png'));
              } catch (err) {
                console.error('Failed to generate thumbnail from video:', err);
              } finally {
                setGeneratingThumbnail(false);
                // Clean up object URL
                if (objectUrlRef.current) {
                  URL.revokeObjectURL(objectUrlRef.current);
                  objectUrlRef.current = null;
                }
              }
            });
            video.addEventListener('error', (err) => {
              console.error('Video loading error for thumbnail:', err);
              setGeneratingThumbnail(false);
              if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
              }
            });
          } catch (err) {
            console.error('Failed to create video element for thumbnail:', err);
            setGeneratingThumbnail(false);
          }
        }
      } else {
        // Native: use Expo VideoThumbnails at 0.1s
        VideoThumbnails.getThumbnailAsync(uri, { time: 0.1 })
          .then(({ uri }) => setThumbnail(uri))
          .catch(() => setThumbnail(null))
          .finally(() => setGeneratingThumbnail(false));
      }
      // Clean up on unmount
      return () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }, [videoUri]);

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

                const finalStatus = result.status || 'processing';
                setStatus(finalStatus === 'pending_processing'
                    ? 'Upload complete! Preparing analysis...'
                    : 'Upload complete! Analysis starting shortly...');

                router.replace('/(tabs)/history');

                setTimeout(() => {
                    const message = finalStatus === 'pending_processing'
                        ? 'Your video upload is complete. We will begin processing it in just a moment.'
                        : 'Your video has been uploaded and is being analyzed in the background. You can view it in your video history.';
                    Alert.alert('Upload Successful', message);
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
            {/* Video or thumbnail preview at the top */}
            <View style={styles.videoContainer}>
                {showVideo ? (
                  Platform.OS === 'web' ? (
                    <div
                      id="climb-coach-upload-video-container"
                      ref={videoContainerRef}
                      style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                    >
                      <video
                        id="climb-coach-upload-video-player"
                        src={videoUri as string}
                        controls
                        autoPlay
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                      />
                    </div>
                  ) : (
                    <Video
                      ref={videoRef}
                      style={styles.nativeVideo}
                      source={{ uri: videoUri as string }}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls
                      isLooping={false}
                      shouldPlay={true}
                    />
                  )
                ) : (
                  <TouchableOpacity
                    style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={0.8}
                    onPress={() => setShowVideo(true)}
                    disabled={generatingThumbnail}
                  >
                    {generatingThumbnail ? (
                      <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                        <ActivityIndicator size="large" color="#fff" />
                        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.85)" />
                        </View>
                      </View>
                    ) : (
                      <>
                        {thumbnail ? (
                          <Image
                            source={{ uri: thumbnail }}
                            style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 0, backgroundColor: '#000' }}
                          />
                        ) : (
                          <View style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
                        )}
                        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.85)" />
                        </View>
                      </>
                    )}
                  </TouchableOpacity>
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