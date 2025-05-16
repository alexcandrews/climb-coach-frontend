import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { getVideo, VideoDetails } from '@/lib/api/videos';

// Create a custom CSS style for the video player
const videoStyles = Platform.OS === 'web' ? 
  `
    #climb-coach-video-container,
    #climb-coach-video-container * {
      transform: rotate(0deg) !important;
    }
    #climb-coach-video-player {
      transform: rotate(0deg) !important;
    }
    #climb-coach-video-player:-webkit-full-screen {
      transform: rotate(0deg) !important;
    }
    #climb-coach-video-player::-webkit-media-controls {
      transform: rotate(0deg) !important;
    }
    #climb-coach-video-player::-webkit-media-controls-timeline {
      transform: rotate(0deg) !important;
    }
  ` : '';

export default function VideoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef(null);
  
  // Track video playback status
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  
  // Web-specific refs and effects - moved to component top level
  const videoContainerRef = useRef(null);
  
  // Effect to inject custom CSS for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Create and inject a style element
      const styleElement = document.createElement('style');
      styleElement.textContent = videoStyles;
      document.head.appendChild(styleElement);
      
      // Cleanup on unmount
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);
  
  // Effect to handle web video element creation
  useEffect(() => {
    if (Platform.OS === 'web' && videoContainerRef.current && video) {
      // Clear previous content
      const container = videoContainerRef.current as HTMLDivElement;
      container.innerHTML = '';
      
      // Create and configure video element
      const videoElement = document.createElement('video');
      videoElement.id = 'climb-coach-video-player';
      videoElement.src = video.videoUrl;
      videoElement.controls = true;
      videoElement.playsInline = true;
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'contain';
      videoElement.style.transform = 'rotate(0deg)';
      
      // Prevent the hover issue by explicitly handling mouse events
      videoElement.addEventListener('mouseenter', (e) => {
        e.preventDefault();
        videoElement.style.transform = 'rotate(0deg)';
      });
      
      // Add to container
      container.appendChild(videoElement);
    }
  }, [video, videoContainerRef.current]);

  useEffect(() => {
    const loadVideo = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid video ID');
        setLoading(false);
        return;
      }

      try {
        const videoData = await getVideo(id);
        if (videoData) {
          setVideo(videoData);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        setError('Failed to load video');
        console.error('Error loading video:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id]);

  // Handle status updates from the video player
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
  };

  // Render platform-specific video player
  const renderVideoPlayer = () => {
    if (!video) return null;
    
    if (Platform.OS === 'web') {
      // Return the container that will be populated by the useEffect
      return (
        <div 
          id="climb-coach-video-container"
          ref={videoContainerRef}
          style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#000',
            position: 'relative',
            transform: 'rotate(0deg)',
          }}
        />
      );
    } else {
      // For native platforms, use the Expo Video component
      return (
        <Video
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          shouldPlay={false}
          positionMillis={0}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={(error) => console.error("Video playback error:", error)}
        />
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !video) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load video'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
        }}
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{video.title}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            {new Date(video.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.metaText}> • </Text>
          <Text style={styles.metaText}>{"Indoor Climbing"}</Text>
        </View>

        <View style={styles.videoOuterContainer}>
          <View style={styles.videoContainer}>
            {renderVideoPlayer()}
          </View>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Coaching Insights</Text>
          {video.insights.length === 0 ? (
            <Text style={styles.noInsightsText}>Analysis in progress...</Text>
          ) : (
            video.insights
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.timestamp}>
                    {insight.timestamp.toFixed(1)}s
                  </Text>
                  <Text style={styles.insightText}>{insight.coaching}</Text>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 16,
    color: Colors.muted,
  },
  videoOuterContainer: {
    width: '100%',
    marginBottom: 24,
    paddingBottom: 40,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    minHeight: 200,
    ...(Platform.OS === 'web' ? {
      position: 'relative',
      zIndex: 1,
    } : {})
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      minHeight: 250,
      marginBottom: 36,
    } : {})
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  noInsightsText: {
    fontSize: 16,
    color: Colors.muted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.muted,
  },
  timestamp: {
    width: 60,
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '500',
  },
  insightText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
}); 