import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { createVideoFormData } from '@/lib/api/videos';
import api from '@/lib/api';

export default function VideoUploadDetailsScreen() {
  const router = useRouter();
  const { videoUri } = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preview & Upload</Text>
      {status ? <Text style={styles.statusText}>{status}</Text> : null}
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: videoUri as string }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
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
    marginBottom: 16 
  },
  statusText: {
    textAlign: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    marginBottom: 16,
  },
  videoContainer: {
    height: 240,
    marginBottom: 24,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8,
    padding: 12, 
    marginBottom: 16, 
    fontSize: 16,
  },
});