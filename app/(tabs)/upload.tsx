import React, { useState } from "react";
import { View, Alert, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from '@expo/vector-icons';
import { DEV_MODE } from '../config';
import supabase from '@/lib/supabase';

// Import video services
import { 
    uploadVideo, 
    parseCoachingMoments,
    CoachingInsight
} from '@/lib/api/videos';

// Import seed data for development
const SEED_VIDEO_URI = require('../../seeds/climbing-video.mp4');
const SEED_COACHING_MOMENTS = require('../../seeds/coaching-moments.json');

export default function UploadScreen() {
    const [status, setStatus] = useState("");
    const [coachingInsights, setCoachingInsights] = useState<CoachingInsight[]>([]);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [uploading, setUploading] = useState(false);

    // Use seed data in development mode (set to false by default)
    const useSeedData = DEV_MODE && false;

    // Handle video upload
    const handleVideoUpload = async () => {
        if (useSeedData) {
            Alert.alert("Development Mode", "Using seed data instead of uploading");
            return;
        }

        // Request permissions to access photo library
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Please allow access to your photo library.");
            return;
        }

        // Pick a video from the Photos app
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: false,
            quality: 1,
        });

        if (result.canceled) return;
        let video = result.assets[0];

        // Set the video URI for playback
        setVideoUri(video.uri);
        setVideoDuration(0); // Reset duration until new video loads

        // Show uploading status
        setStatus("Uploading video to server...");
        setUploading(true);

        try {
            // Upload video
            const result = await uploadVideo(video.uri);
            
            if (result.url) {
                setStatus("✅ Upload successful!");
                console.log("Video URL:", result.url);
                setTimeout(() => setStatus(""), 2000);
            } else {
                setStatus(`❌ ${result.error || 'Upload failed'}`);
                Alert.alert("Upload Failed", result.error || 'Unknown error');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {status ? <Text style={styles.statusOverlay}>{status}</Text> : null}
            
            <View style={{flex: 1, backgroundColor: '#000'}}>
                {videoUri ? (
                    <Video
                        source={{uri: videoUri}}
                        style={{flex: 1}}
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls
                        onLoad={(status) => {
                            // Check if the playback is ready and duration available
                            if (status.isLoaded && status.durationMillis) {
                                setVideoDuration(status.durationMillis / 1000);
                            }
                        }}
                    />
                ) : (
                    <View style={styles.uploadPrompt}>
                        <TouchableOpacity 
                            style={styles.uploadButton} 
                            onPress={handleVideoUpload}
                        >
                            <FontAwesome name="upload" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.uploadText}>Tap to upload a climbing video</Text>
                    </View>
                )}
            </View>
            
            {coachingInsights.length > 0 && (
                <View style={styles.insightsContainer}>
                    <Text style={styles.sectionTitle}>Coaching Insights</Text>
                    <ScrollView style={styles.insightsList}>
                        {coachingInsights.map((insight, index) => (
                            <View key={index} style={styles.insightItem}>
                                <Text style={styles.timestamp}>
                                    {Math.floor(insight.timestamp / 60)}:{(insight.timestamp % 60).toString().padStart(2, '0')}
                                </Text>
                                <Text style={styles.coaching}>{insight.coaching}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7F5',
    },
    statusOverlay: {
        position: 'absolute',
        top: 16,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: 8,
        borderRadius: 8,
        zIndex: 10,
        fontSize: 14,
    },
    uploadPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#333',
    },
    uploadButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3DA9FC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    uploadText: {
        color: '#fff',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        color: '#333',
    },
    insightsContainer: {
        padding: 16,
        backgroundColor: '#fff',
        maxHeight: 200,
    },
    insightsList: {
        maxHeight: 160,
    },
    insightItem: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    timestamp: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3DA9FC',
        width: 50,
    },
    coaching: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    }
});
