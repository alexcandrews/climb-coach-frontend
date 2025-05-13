import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useVideos from '../../lib/api/hooks/useVideos';
import Colors from '@/constants/Colors';

export default function HistoryScreenWithGeneratedApi() {
  const router = useRouter();
  const { videos, loading, error, refetch } = useVideos();

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'My Climbing History',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'My Climbing History',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'My Climbing History',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No climbing videos found</Text>
          <Text style={styles.emptySubText}>
            Upload videos from the Upload tab to get feedback on your climbing technique.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'My Climbing History',
          headerShadowVisible: false,
        }}
      />
      
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => router.push(`/video/${item.id}`)}
          >
            <View style={styles.thumbnailContainer}>
              {item.thumbnail_url ? (
                <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
              ) : (
                <View style={styles.placeholderThumbnail}>
                  <Ionicons name="videocam" size={36} color={Colors.text} />
                </View>
              )}
            </View>
            
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={1}>{item.title || 'Untitled Video'}</Text>
              <Text style={styles.videoDate}>
                {item.created_at 
                  ? new Date(item.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Unknown date'
                }
              </Text>
              
              <TouchableOpacity 
                style={styles.insightsButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/video/${item.id}`);
                }}
              >
                <Text style={styles.insightsText}>
                  {item.coaching_insights && Array.isArray(item.coaching_insights) && item.coaching_insights.length > 0
                    ? `${item.coaching_insights.length} Insights`
                    : 'Analysis in progress...'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.muted,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: Colors.muted,
    textAlign: 'center',
    maxWidth: '80%',
  },
  list: {
    padding: 16,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    width: 120,
    height: 120,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  videoDate: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: 8,
  },
  insightsButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  insightsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
}); 