import React, { useState, useRef, useEffect } from "react";
import { View, Alert, StyleSheet, Platform, Switch, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import VideoPlayer from '../components/VideoPlayer';
import Timeline from '../components/Timeline';
import SwipeableBottomSheet from '../components/SwipeableBottomSheet';
import { DEV_MODE, API_CONFIG } from '../config';
import Colors, { Spacing, Shadows } from '@/constants/Colors';

// Import seed data
const SEED_VIDEO_URI = require('../../seeds/climbing-video.mp4');
const SEED_COACHING_MOMENTS = require('../../seeds/coaching-moments.json');

interface CoachingInsight {
    timestamp: number;
    coaching: string;
    type: string;
    confidence: number;
}

const parseCoachingMoments = (data: any): CoachingInsight[] => {
    try {
        if (typeof data === 'string') {
            // Try parsing directly first
            try {
                return JSON.parse(data);
            } catch {
                // If direct parsing fails, try to extract JSON array
                const jsonMatch = data.match(/\[[\s\S]*?\]/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
        } else if (data.coaching_moments) {
            // Try parsing the coaching_moments string
            try {
                return JSON.parse(data.coaching_moments);
            } catch {
                // If direct parsing fails, try to extract JSON array
                const jsonMatch = data.coaching_moments.match(/\[[\s\S]*?\]/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
        } else if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (error) {
        console.error('Error parsing coaching moments:', error);
        return [];
    }
};

export default function UploadScreen() {
    const [status, setStatus] = useState("");
    const [uploading, setUploading] = useState(false);
    const [coachingInsights, setCoachingInsights] = useState<CoachingInsight[]>([]);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [useSeedData, setUseSeedData] = useState(false);
    const videoRef = useRef<Video>(null);

    // Load seed data when useSeedData is enabled
    useEffect(() => {
        if (useSeedData) {
            setVideoUri(SEED_VIDEO_URI);
            const parsedMoments = parseCoachingMoments(SEED_COACHING_MOMENTS);
            setCoachingInsights(parsedMoments);
            setStatus("");  // Don't show "Using seed data" message
        } else {
            setVideoUri(null);
            setCoachingInsights([]);
            setVideoDuration(0);
            setStatus("");
        }
    }, [useSeedData]);

    const handleVideoLoad = (duration: number) => {
        setVideoDuration(duration);
    };

    const handlePositionChange = (position: number) => {
        setCurrentPosition(position);
    };

    const handleSeek = (position: number) => {
        if (videoRef.current) {
            setCurrentPosition(position);
        }
    };

    const uploadVideo = async () => {
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

        const formData = new FormData();

        if (Platform.OS === "web") {
            // Special handling for web
            const response = await fetch(video.uri);
            const blob = await response.blob();
            formData.append("video", new File([blob], "upload.mp4", { type: "video/mp4" }));
        } else {
            // Mobile (iOS/Android)
            formData.append("video", {
                uri: video.uri,
                name: "upload.mp4",
                type: "video/mp4",
            } as any);
        }

        setStatus("Uploading...");
        setUploading(true);

        try {
            let response = await axios.post(
                `${API_CONFIG.BASE_URL}/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                setStatus("✅ Upload successful! Processing...");
                const parsedMoments = parseCoachingMoments(response.data.coaching_moments);
                setCoachingInsights(parsedMoments);
                setTimeout(() => setStatus(""), 1000);
            } else {
                const errorMessage = response.data?.message || response.data?.error || 'Upload failed';
                setStatus(`❌ ${errorMessage}`);
            }
        } catch (error: any) {
            console.error("❌ Upload Error:", error);
            let errorMessage = "Error uploading video";
            
            if (error.response) {
                // Server responded with error
                const data = error.response.data;
                errorMessage = data?.message || data?.error || `Server error: ${error.response.status}`;
            } else if (error.request) {
                // Request made but no response
                errorMessage = "No response from server. Check your internet connection.";
            } else {
                // Error in request setup
                errorMessage = error.message || "Failed to make request";
            }
            
            if (DEV_MODE) {
                errorMessage += `\n(${error.message})`;
            }
            
            setStatus(`❌ ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                <VideoPlayer 
                    videoUri={videoUri}
                    videoRef={videoRef}
                    onSelectVideo={uploadVideo}
                    onLoadComplete={handleVideoLoad}
                    onPositionChange={handlePositionChange}
                    seekTo={currentPosition}
                />
            </View>

            {DEV_MODE && (
                <View style={styles.devModeContainer}>
                    <View style={styles.seedDataToggle}>
                        <Text style={styles.devModeText}>Use Seed Data</Text>
                        <Switch
                            value={useSeedData}
                            onValueChange={setUseSeedData}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={useSeedData ? '#2196F3' : '#f4f3f4'}
                        />
                    </View>
                </View>
            )}

            {videoUri && (
                <SwipeableBottomSheet>
                    <Timeline 
                        uploading={uploading}
                        status={status}
                        coachingInsights={coachingInsights}
                        videoDuration={videoDuration}
                        currentPosition={currentPosition}
                        onSeek={handleSeek}
                    />
                </SwipeableBottomSheet>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    videoContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    devModeContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    seedDataToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: Spacing.sm,
        backgroundColor: 'transparent',
    },
    devModeText: {
        marginRight: 10,
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
