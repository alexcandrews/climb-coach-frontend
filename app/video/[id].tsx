import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { getVideo, VideoDetails } from '@/lib/api/videos';

export default function VideoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: '',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.background.default },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
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
            headerStyle: { backgroundColor: Colors.background.default },
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
          headerStyle: { backgroundColor: Colors.background.default },
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

        <View style={styles.videoContainer}>
          <Video
            source={{ uri: video.videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
          />
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
    backgroundColor: Colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  video: {
    flex: 1,
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  noInsightsText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary.dark,
  },
  timestamp: {
    width: 60,
    fontSize: 16,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  insightText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
}); 